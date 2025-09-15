import { useState, useRef, useCallback, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import NavBar from '../components/NavBar';

// Types for algorithm visualization
interface ArrayElement {
  value: number;
  index: number;
  status: 'idle' | 'current' | 'found' | 'checked';
}

interface AlgorithmStep {
  type: 'compare' | 'found' | 'not_found' | 'move';
  currentIndex: number;
  targetValue?: number;
  description: string;
  highlightLine?: number;
}

interface ParsedAlgorithm {
  array: number[];
  target?: number;
  algorithmType: 'linear_search' | 'binary_search' | 'unknown';
  steps: AlgorithmStep[];
}

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

  const editorRef = useRef<any>(null);
  const timeoutRef = useRef<number | null>(null);

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

  // Code parsing function
  const parseCode = useCallback((inputCode: string): ParsedAlgorithm | null => {
    try {
      // Extract array from code
      const arrayMatch = inputCode.match(/(?:const|let|var)\s+\w+\s*=\s*\[([^\]]+)\]/) ||
                        inputCode.match(/\[([^\]]+)\]/);
      
      if (!arrayMatch) {
        throw new Error('No array found in code');
      }

      const arrayValues = arrayMatch[1]
        .split(',')
        .map(val => parseInt(val.trim()))
        .filter(val => !isNaN(val));

      // Extract target value
      const targetMatch = inputCode.match(/(?:const|let|var)\s+target\s*=\s*(\d+)/) ||
                         inputCode.match(/target\s*=\s*(\d+)/);
      
      const target = targetMatch ? parseInt(targetMatch[1]) : undefined;

      // Determine algorithm type
      let algorithmType: 'linear_search' | 'binary_search' | 'unknown' = 'unknown';
      if (inputCode.includes('for') && inputCode.includes('i++')) {
        algorithmType = 'linear_search';
      } else if (inputCode.includes('while') && inputCode.includes('mid')) {
        algorithmType = 'binary_search';
      } else {
        algorithmType = 'linear_search'; // Default fallback
      }

      // Generate steps for linear search
      const steps: AlgorithmStep[] = [];
      
      if (algorithmType === 'linear_search' && target !== undefined) {
        for (let i = 0; i < arrayValues.length; i++) {
          steps.push({
            type: 'compare',
            currentIndex: i,
            targetValue: target,
            description: `Comparing arr[${i}] (${arrayValues[i]}) with target (${target})`,
            highlightLine: 2
          });

          if (arrayValues[i] === target) {
            steps.push({
              type: 'found',
              currentIndex: i,
              targetValue: target,
              description: `Found target ${target} at index ${i}!`,
              highlightLine: 3
            });
            break;
          }
        }

        // Add not found step if target wasn't found
        if (!steps.some(step => step.type === 'found')) {
          steps.push({
            type: 'not_found',
            currentIndex: arrayValues.length,
            targetValue: target,
            description: `Target ${target} not found in array`,
            highlightLine: 6
          });
        }
      }

      return {
        array: arrayValues,
        target,
        algorithmType,
        steps
      };
    } catch (error) {
      console.error('Failed to parse code:', error);
      return null;
    }
  }, []);

  // Convert code to visualization data
  const handleConvert = useCallback(() => {
    const parsed = parseCode(code);
    if (parsed) {
      setParsedData(parsed);
      
      // Create array elements
      const newElements: ArrayElement[] = parsed.array.map((value, index) => ({
        value,
        index,
        status: 'idle'
      }));
      
      setElements(newElements);
      setCurrentStep(-1);
      setPointer(-1);
      setMessage(`Array loaded: [${parsed.array.join(', ')}]${parsed.target ? ` | Target: ${parsed.target}` : ''}`);
    } else {
      setMessage('Failed to parse code. Please check your array syntax.');
    }
  }, [code, parseCode]);

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

      // Update element statuses
      setElements(prev => prev.map((el, idx) => {
        if (idx === step.currentIndex) {
          return { ...el, status: step.type === 'found' ? 'found' : 'current' };
        } else if (idx < step.currentIndex) {
          return { ...el, status: 'checked' };
        } else {
          return { ...el, status: 'idle' };
        }
      }));

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

  return (
    <div className="min-h-screen bg-gray-900">
      <NavBar />
      <div className="flex h-screen bg-gray-900 text-white">
        {/* Left Panel - Code Editor */}
        <div className="w-1/2 flex flex-col border-r border-gray-700">
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
        <div className="w-1/2 flex flex-col bg-gray-900">
          <div className="bg-gray-800 p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-2">Algorithm Visualization</h2>
            <div className="text-sm text-gray-300">
              {message || 'Load code and click Convert to start'}
            </div>
          </div>
          <div className="flex-1 p-8 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-5">
              <div className="grid grid-cols-10 grid-rows-10 h-full w-full">
                {Array.from({ length: 100 }).map((_, i) => (
                  <div key={i} className="border border-cyan-400/20"></div>
                ))}
              </div>
            </div>

            {elements.length > 0 ? (
              <>
                {/* Array Title */}
                <div className="mb-8 text-center">
                  <h3 className="text-xl font-bold text-cyan-400 mb-2">
                    {parsedData?.algorithmType === 'linear_search' ? 'Linear Search' : 'Algorithm'} Visualization
                  </h3>
                  <p className="text-gray-400">
                    {parsedData?.target ? `Searching for: ${parsedData.target}` : 'Algorithm in progress'}
                  </p>
                </div>

                {/* Pointer Arrow */}
                <AnimatePresence>
                  {pointer >= 0 && (
                    <motion.div
                      key={`pointer-${pointer}`}
                      className="absolute"
                      style={{
                        left: `calc(50% + ${(pointer - (elements.length - 1) / 2) * 100}px - 12px)`,
                        top: '45%'
                      }}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-yellow-400 text-2xl">↓</div>
                      <div className="text-xs text-yellow-400 font-bold mt-1">i = {pointer}</div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Array Elements */}
                <div className="flex items-center gap-4 mb-8">
                  <AnimatePresence mode="popLayout">
                    {elements.map((element) => (
                      <motion.div
                        key={`element-${element.index}`}
                        className={clsx(
                          "relative w-20 h-20 rounded-xl border-2 flex items-center justify-center text-xl font-bold text-white cursor-pointer",
                          element.status === 'idle' && "border-gray-500 bg-gray-600",
                          element.status === 'current' && "border-yellow-400 bg-yellow-500 shadow-lg shadow-yellow-400/50",
                          element.status === 'found' && "border-green-400 bg-green-500 shadow-lg shadow-green-400/50",
                          element.status === 'checked' && "border-red-400 bg-red-500"
                        )}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ 
                          scale: element.status === 'current' ? 1.1 : element.status === 'found' ? 1.15 : 1,
                          opacity: 1
                        }}
                        transition={{
                          duration: 0.4,
                          type: "spring",
                          stiffness: 200,
                          damping: 20
                        }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <span className="relative z-10">{element.value}</span>
                        
                        {/* Target indicator */}
                        {parsedData?.target === element.value && (
                          <motion.div
                            className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center text-xs font-bold text-black"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            🎯
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Array Indices */}
                <div className="flex items-center gap-4">
                  {elements.map((element) => (
                    <motion.div
                      key={`index-${element.index}`}
                      className={clsx(
                        "w-20 text-center text-sm font-mono transition-all duration-300",
                        element.status === 'current' ? "text-yellow-400 font-bold" :
                        element.status === 'found' ? "text-green-400 font-bold" :
                        element.status === 'checked' ? "text-red-400" :
                        "text-gray-500"
                      )}
                      layout
                    >
                      [{element.index}]
                    </motion.div>
                  ))}
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
