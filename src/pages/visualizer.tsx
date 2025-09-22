import { useState, useRef, useCallback, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import NavBar from '../components/NavBar';
import { AIAnalyzer, type AIAnalysisResult, type AlgorithmStep } from '../services/ai/aiAnalyzer';

// Types for algorithm visualization
interface ArrayElement {
  value: number;
  index: number;
  status: 'idle' | 'current' | 'found' | 'checked';
}

// Using AIAnalysisResult instead of ParsedAlgorithm for consistency
type ParsedAlgorithm = AIAnalysisResult;

export default function Visualizer() {
  // State management
  const [code, setCode] = useState<string>('');
  const [parsedData, setParsedData] = useState<ParsedAlgorithm | null>(null);
  const [elements, setElements] = useState<ArrayElement[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1000);
  const [pointer, setPointer] = useState<number>(-1);
  const [message, setMessage] = useState<string>('');
  const [showOutput, setShowOutput] = useState<boolean>(false);
  const [outputText, setOutputText] = useState<string>('');

  // const editorRef = useRef<any>(null);
  const timeoutRef = useRef<number | null>(null);
  const vizContainerRef = useRef<HTMLDivElement | null>(null);
  const elementRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number } | null>(null);

  // Sample code for demonstration
  const sampleCode = `function linearSearch(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) {
            return i; // Found at index i
        }
    }
    return -1; // Not found
}

// Test data
const numbers = [64, 34, 25, 12, 22, 11, 90, 88];
const target = 22;
const result = linearSearch(numbers, target);`;

  // Initialize with sample code
  useEffect(() => {
    setCode(sampleCode);
  }, []);

  // Convert code to visualization data using AI
  const handleConvert = useCallback(() => {
    setMessage('🤖 AI analyzing your code...');
    
    // Use AI analyzer instead of basic parsing
    const analyzed = AIAnalyzer.analyzeCode(code);
    if (analyzed) {
      setParsedData(analyzed);
      
      // Create array elements
      const newElements: ArrayElement[] = analyzed.array.map((value, index) => ({
        value,
        index,
        status: 'idle'
      }));
      
      setElements(newElements);
      setCurrentStep(-1);
      setPointer(-1);
      
      // Enhanced message with AI insights
      const algorithmName = analyzed.algorithmType.replace('_', ' ').toUpperCase();
      const complexityInfo = analyzed.complexity ? ` | Time: ${analyzed.complexity.time}, Space: ${analyzed.complexity.space}` : '';
      setMessage(`✅ AI Analysis Complete: ${algorithmName} detected | Array: [${analyzed.array.join(', ')}]${analyzed.target ? ` | Target: ${analyzed.target}` : ''}${complexityInfo}`);
    } else {
      setMessage('❌ AI analysis failed. Please check your code syntax and ensure it contains a valid algorithm.');
    }
  }, [code]);

  // Run algorithm visualization
  const handleRun = useCallback(() => {
    if (!parsedData || isRunning) return;

    setIsRunning(true);
    setCurrentStep(0);
    setMessage('Starting algorithm visualization...');

    const runStep = (stepIndex: number) => {
      if (stepIndex >= parsedData.steps.length) {
        setIsRunning(false);
        setPointer(-1);
        return;
      }

      const step = parsedData.steps[stepIndex];
      setCurrentStep(stepIndex);
      setPointer(step.currentIndex);
      setMessage(step.description);

      // Update element statuses with enhanced AI step handling
      setElements(prev => {
        let newElements = [...prev];
        
        // Handle swapping for sorting algorithms
        if (step.type === 'swap' && step.secondaryIndex !== undefined) {
          // Physically swap the elements in the array
          const temp = newElements[step.currentIndex];
          newElements[step.currentIndex] = newElements[step.secondaryIndex];
          newElements[step.secondaryIndex] = temp;
          
          // Update their indices
          newElements[step.currentIndex].index = step.currentIndex;
          newElements[step.secondaryIndex].index = step.secondaryIndex;
        }
        
        // Apply visual status updates
        return newElements.map((el, idx) => {
          if (idx === step.currentIndex) {
            return { 
              ...el, 
              status: step.type === 'found' ? 'found' : 'current' 
            };
          } else if (step.secondaryIndex !== undefined && idx === step.secondaryIndex) {
            return { 
              ...el, 
              status: step.type === 'swap' ? 'current' : 'current' 
            };
          } else if (step.type === 'compare' && idx < step.currentIndex) {
            return { ...el, status: 'checked' };
          } else {
            return { ...el, status: 'idle' };
          }
        });
      });

      timeoutRef.current = setTimeout(() => runStep(stepIndex + 1), animationSpeed);
    };

    runStep(0);
  }, [parsedData, isRunning, animationSpeed]);

  // Stop algorithm
  const handleStop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsRunning(false);
    setCurrentStep(-1);
    setPointer(-1);
    
    // Reset all elements to idle
    setElements(prev => prev.map(el => ({ ...el, status: 'idle' })));
    setMessage('Algorithm stopped');
  }, []);

  // Recalculate pointer position whenever the pointer index or elements change
  useEffect(() => {
    if (pointer < 0 || !vizContainerRef.current) {
      setPointerPos(null);
      return;
    }
    const el = elementRefs.current[pointer];
    const container = vizContainerRef.current;
    if (!el) {
      setPointerPos(null);
      return;
    }
    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    setPointerPos({
      x: elRect.left - containerRect.left + elRect.width / 2,
      y: elRect.top - containerRect.top,
    });
  }, [pointer, elements, parsedData]);

  // Recompute pointer on window resize
  useEffect(() => {
    const onResize = () => {
      if (pointer >= 0) {
        const el = elementRefs.current[pointer];
        const container = vizContainerRef.current;
        if (el && container) {
          const elRect = el.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          setPointerPos({
            x: elRect.left - containerRect.left + elRect.width / 2,
            y: elRect.top - containerRect.top,
          });
        }
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [pointer]);

  return (
    <div className="min-h-screen bg-gray-900">
      <NavBar />
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] bg-gray-900 text-white">
        {/* Left Panel - Code Editor */}
        <div className="w-full lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-700">
          <div className="bg-gray-800 p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-2">Algorithm Code Editor</h2>
            <div className="flex gap-3">
              <button 
                onClick={handleConvert}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200">
                Convert
              </button>
              <button 
                onClick={isRunning ? handleStop : handleRun}
                disabled={!parsedData}
                className={clsx(
                  'px-4 py-2 rounded-lg font-medium transition-all duration-200',
                  isRunning
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed'
                )}
              >
                {isRunning ? 'Stop' : 'Run'}
              </button>
              <button 
                onClick={() => {
                  if (parsedData?.output) {
                    setOutputText(parsedData.output);
                    setShowOutput(true);
                  } else {
                    setOutputText('No output available. Please convert code first.');
                    setShowOutput(true);
                  }
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200">
                Opt
              </button>
            </div>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              language="javascript"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                selectOnLineNumbers: true,
                theme: 'vs-dark'
              }}
            />
          </div>

          {/* Output Display Panel */}
          {showOutput && (
            <div className="bg-gray-800 p-4 border-t border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-white">Code Output</h3>
                <button 
                  onClick={() => setShowOutput(false)}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="bg-black p-3 rounded text-green-400 font-mono text-sm overflow-x-auto max-h-32 overflow-y-auto">
                {outputText}
              </div>
            </div>
          )}

          {/* Speed Control */}
          <div className="bg-gray-800 p-4 border-t border-gray-700">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-300">Animation Speed:</label>
              <input
                type="range"
                min="200"
                max="2000"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-400 min-w-[4rem]">{animationSpeed}ms</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Visualization */}
        <div className="w-full lg:w-1/2 flex flex-col bg-gray-900">
          <div className="bg-gray-800 px-4 py-3 sm:p-4 border-b border-gray-700">
            <h2 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">Algorithm Visualization</h2>
            <div className="text-xs sm:text-sm text-gray-300">
              {message || 'Load code and click Convert to start'}
            </div>
          </div>
          <div ref={vizContainerRef} className="flex-1 p-6 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Grid */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
                  {Array.from({ length: 144 }).map((_, i) => (
                    <div key={i} className="border border-white/10"></div>
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5" />
            </div>

            {elements.length > 0 ? (
              <>
                {/* Array Title */}
                <div className="mb-6 sm:mb-8 text-center">
                  <h3 className="text-lg sm:text-xl font-bold text-cyan-400 mb-1 sm:mb-2">
                    {parsedData?.algorithmType === 'linear_search' ? 'Linear Search' :
                     parsedData?.algorithmType === 'binary_search' ? 'Binary Search' :
                     parsedData?.algorithmType === 'bubble_sort' ? 'Bubble Sort' :
                     parsedData?.algorithmType === 'selection_sort' ? 'Selection Sort' :
                     parsedData?.algorithmType === 'insertion_sort' ? 'Insertion Sort' :
                     'Algorithm'} Visualization
                  </h3>
                  <p className="text-sm sm:text-base text-gray-400">
                    {parsedData?.target ? `Searching for: ${parsedData.target}` : 
                     parsedData?.algorithmType?.includes('sort') ? 'Sorting array elements' : 
                     'Algorithm in progress'}
                    {parsedData?.complexity && (
                      <span className="ml-2 text-xs text-purple-400">
                        | Time: {parsedData.complexity.time} | Space: {parsedData.complexity.space}
                      </span>
                    )}
                  </p>
                </div>

                {/* Pointer Arrow (dynamically positioned) */}
                <AnimatePresence>
                  {pointer >= 0 && pointerPos && (
                    <motion.div
                      key={`pointer-${pointer}`}
                      className="absolute z-20 -translate-x-1/2"
                      style={{ left: pointerPos.x, top: Math.max(8, pointerPos.y - 28) }}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-yellow-400 text-2xl leading-none">↓</div>
                      <div className="text-[10px] text-yellow-400 font-bold mt-1 text-center">i = {pointer}</div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Array Elements (responsive grid with indices) */}
                <div className="w-full max-w-5xl mb-4">
                  <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                    <AnimatePresence mode="popLayout">
                      {elements.map((element) => (
                        <div key={`wrap-${element.index}`} className="flex flex-col items-center">
                          <motion.div
                            ref={(el) => { elementRefs.current[element.index] = el; }}
                            key={`element-${element.index}`}
                            className={clsx(
                              "relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 flex items-center justify-center text-lg sm:text-xl font-bold text-white cursor-pointer",
                              element.status === 'idle' && "border-gray-500/80 bg-gray-700",
                              element.status === 'current' && "border-yellow-400 bg-yellow-500 shadow-lg shadow-yellow-400/20",
                              element.status === 'found' && "border-green-400 bg-green-500 shadow-lg shadow-green-400/20",
                              element.status === 'checked' && "border-red-400 bg-red-500/90"
                            )}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ 
                              scale: element.status === 'current' ? 1.06 : element.status === 'found' ? 1.1 : 1,
                              opacity: 1
                            }}
                            transition={{ duration: 0.25 }}
                            whileHover={{ scale: 1.04 }}
                          >
                            <span className="relative z-10 select-none">{element.value}</span>
                            {parsedData?.target === element.value && (
                              <motion.div
                                className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-cyan-400 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-black"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1 }}
                              >
                                🎯
                              </motion.div>
                            )}
                          </motion.div>
                          <div className={clsx(
                            "mt-1 text-[10px] sm:text-xs font-mono",
                            element.status === 'current' ? "text-yellow-400 font-semibold" :
                            element.status === 'found' ? "text-green-400 font-semibold" :
                            element.status === 'checked' ? "text-red-400" :
                            "text-gray-400"
                          )}>
                            [{element.index}]
                          </div>
                        </div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Algorithm Status */}
                <AnimatePresence>
                  {currentStep >= 0 && parsedData && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="mt-8 bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-700"
                    >
                      <div className="text-center">
                        <div className="text-cyan-400 font-semibold mb-2">
                          Step {currentStep + 1} of {parsedData.steps.length}
                        </div>
                        <div className="text-gray-300">
                          {parsedData.steps[currentStep]?.description}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <div className="text-center">
                <div className="text-6xl text-gray-600 mb-4">📊</div>
                <h3 className="text-xl text-gray-400 mb-2">No Data to Visualize</h3>
                <p className="text-gray-500">
                  Write or paste your algorithm code in the editor and click "Convert"
                </p>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="bg-gray-800 p-4 border-t border-gray-700">
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-600 border border-gray-500 rounded"></div>
                <span className="text-gray-400">Idle</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 border border-yellow-400 rounded"></div>
                <span className="text-gray-400">Current</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 border border-red-500 rounded"></div>
                <span className="text-gray-400">Checked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-600 border border-green-500 rounded"></div>
                <span className="text-gray-400">Found</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
