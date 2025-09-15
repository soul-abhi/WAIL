import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Editor } from '@monaco-editor/react';
import clsx from 'clsx';

interface Step {
  type: 'compare' | 'found' | 'not_found';
  index: number;
  value?: number;
  target?: number;
  line: number;
  description: string;
}

const AlgorithmPlayground: React.FC = () => {
  // State management
  const [code, setCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(1);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const [animationState, setAnimationState] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');
  
  // Algorithm state
  const [array, setArray] = useState<number[]>([64, 34, 25, 12, 22, 11, 90]);
  const [target, setTarget] = useState<number>(25);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [comparedIndices, setComparedIndices] = useState<number[]>([]);
  const [foundIndex, setFoundIndex] = useState<number>(-1);
  const [steps, setSteps] = useState<Step[]>([]);

  const editorRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);

  // Sample Java code for linear search
  const sampleCode = `public class Solution {
    public static int linearSearch(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == target) {
                return i;
            }
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        int target = 25;
        int result = linearSearch(arr, target);
        
        if (result != -1) {
            System.out.println("Element found at index: " + result);
        } else {
            System.out.println("Element not found");
        }
    }
}`;

  // Initialize editor with sample code
  useEffect(() => {
    setCode(sampleCode);
  }, []);

  // Generate steps for linear search algorithm
  const generateSteps = (): Step[] => {
    const newSteps: Step[] = [];
    for (let i = 0; i < array.length; i++) {
      newSteps.push({
        type: 'compare',
        index: i,
        value: array[i],
        target: target,
        line: 3,
        description: `Comparing arr[${i}] = ${array[i]} with target = ${target}`
      });
      
      if (array[i] === target) {
        newSteps.push({
          type: 'found',
          index: i,
          value: array[i],
          line: 4,
          description: `Found target ${target} at index ${i}!`
        });
        break;
      }
    }
    
    if (!newSteps.some(step => step.type === 'found')) {
      newSteps.push({
        type: 'not_found',
        index: -1,
        line: 7,
        description: `Target ${target} not found in array`
      });
    }
    
    return newSteps;
  };

  // Handle editor mount
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Configure editor
    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
      ],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#c9d1d9',
        'editorLineNumber.foreground': '#6e7681',
        'editor.selectionBackground': '#264f78',
        'editor.lineHighlightBackground': '#21262d',
      }
    });
    
    monaco.editor.setTheme('custom-dark');
  };

  // Highlight specific line in editor
  const highlightLine = (lineNumber: number | null) => {
    if (editorRef.current && lineNumber) {
      const model = editorRef.current.getModel();
      const range = {
        startLineNumber: lineNumber,
        startColumn: 1,
        endLineNumber: lineNumber,
        endColumn: model.getLineMaxColumn(lineNumber)
      };
      
      editorRef.current.deltaDecorations([], [{
        range: range,
        options: {
          isWholeLine: true,
          className: 'highlighted-line',
          glyphMarginClassName: 'highlighted-glyph'
        }
      }]);
    }
  };

  // Clear line highlights
  const clearHighlights = () => {
    if (editorRef.current) {
      editorRef.current.deltaDecorations([], []);
    }
  };

  // Run algorithm animation
  const runAlgorithm = () => {
    const algorithmSteps = generateSteps();
    setSteps(algorithmSteps);
    setCurrentStep(0);
    setIsRunning(true);
    setIsPaused(false);
    setAnimationState('running');
    setCurrentIndex(-1);
    setComparedIndices([]);
    setFoundIndex(-1);
    
    executeStep(algorithmSteps, 0);
  };

  // Execute individual step
  const executeStep = (algorithmSteps: Step[], stepIndex: number) => {
    if (stepIndex >= algorithmSteps.length) {
      setAnimationState('completed');
      setIsRunning(false);
      clearHighlights();
      return;
    }

    const step = algorithmSteps[stepIndex];
    setCurrentStep(stepIndex);
    setCurrentIndex(step.index);
    
    if (step.index >= 0) {
      setComparedIndices(prev => [...new Set([...prev, step.index])]);
    }
    
    if (step.type === 'found') {
      setFoundIndex(step.index);
    }
    
    // Highlight corresponding line in editor
    highlightLine(step.line);
    setHighlightedLine(step.line);

    // Schedule next step
    const delay = 1000 / speed;
    intervalRef.current = setTimeout(() => {
      if (!isPaused) {
        executeStep(algorithmSteps, stepIndex + 1);
      }
    }, delay);
  };

  // Control functions
  const pauseResume = () => {
    if (isRunning) {
      setIsPaused(!isPaused);
      if (isPaused && steps.length > 0) {
        executeStep(steps, currentStep);
      }
    }
  };

  const stepForward = () => {
    if (steps.length > 0 && currentStep < steps.length - 1) {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
      executeStep(steps, currentStep + 1);
    }
  };

  const reset = () => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
    setIsRunning(false);
    setIsPaused(false);
    setCurrentStep(0);
    setAnimationState('idle');
    setCurrentIndex(-1);
    setComparedIndices([]);
    setFoundIndex(-1);
    setSteps([]);
    clearHighlights();
    setHighlightedLine(null);
  };

  const autoDetect = () => {
    // Simple auto-detection logic for array and target from code
    const arrayMatch = code.match(/\{([^}]+)\}/);
    const targetMatch = code.match(/target\s*=\s*(\d+)/);
    
    if (arrayMatch) {
      const detectedArray = arrayMatch[1].split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
      if (detectedArray.length > 0) {
        setArray(detectedArray);
      }
    }
    
    if (targetMatch) {
      const detectedTarget = parseInt(targetMatch[1]);
      if (!isNaN(detectedTarget)) {
        setTarget(detectedTarget);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-cyan-400">Algorithm Playground</h1>
          <span className="text-sm text-gray-400">Linear Search Visualizer</span>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Control Buttons */}
          <button
            onClick={runAlgorithm}
            disabled={isRunning && !isPaused}
            className={clsx(
              'px-4 py-2 rounded-lg font-semibold transition-all duration-200',
              isRunning && !isPaused
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-green-500/25'
            )}
          >
            Run
          </button>
          
          <button
            onClick={autoDetect}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
          >
            Auto-detect
          </button>
          
          <button
            onClick={stepForward}
            disabled={!steps.length || currentStep >= steps.length - 1}
            className={clsx(
              'px-4 py-2 rounded-lg font-semibold transition-all duration-200',
              !steps.length || currentStep >= steps.length - 1
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg hover:shadow-yellow-500/25'
            )}
          >
            Step
          </button>
          
          <button
            onClick={pauseResume}
            disabled={!isRunning}
            className={clsx(
              'px-4 py-2 rounded-lg font-semibold transition-all duration-200',
              !isRunning
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-purple-500/25'
            )}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          
          <button
            onClick={reset}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-red-500/25"
          >
            Reset
          </button>
          
          {/* Speed Control */}
          <div className="flex items-center space-x-2 ml-4">
            <span className="text-sm text-gray-400">Speed:</span>
            <input
              type="range"
              min="0.25"
              max="2"
              step="0.25"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-sm text-cyan-400 w-8">{speed}x</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Code Editor */}
        <div className="w-[48%] flex flex-col bg-gray-900 border-r border-gray-700">
          <div className="p-3 bg-gray-800 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-gray-200">Code Editor</h2>
            <p className="text-sm text-gray-400">Java Linear Search Implementation</p>
          </div>
          
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="java"
              value={code}
              onChange={(value) => setCode(value || '')}
              onMount={handleEditorDidMount}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
                theme: 'custom-dark',
                padding: { top: 16, bottom: 16 }
              }}
            />
          </div>
        </div>

        {/* Right Panel - Visualizer */}
        <div className="w-[52%] flex flex-col bg-black">
          <div className="p-3 bg-gray-800 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-gray-200">Algorithm Visualization</h2>
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-gray-400">
                Target: <span className="text-cyan-400 font-mono">{target}</span>
              </p>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:border-cyan-400 focus:outline-none"
                />
                <input
                  type="text"
                  value={array.join(', ')}
                  onChange={(e) => {
                    const newArray = e.target.value.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
                    setArray(newArray);
                  }}
                  placeholder="Enter array values"
                  className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:border-cyan-400 focus:outline-none w-40"
                />
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-8 flex flex-col justify-center items-center">
            {/* Array Visualization */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                {array.map((value, index) => (
                  <motion.div
                    key={index}
                    className={clsx(
                      'w-16 h-16 flex items-center justify-center text-lg font-bold rounded-lg border-2 transition-all duration-300',
                      foundIndex === index
                        ? 'bg-green-500 border-green-300 text-white shadow-lg shadow-green-500/50'
                        : currentIndex === index
                        ? 'bg-yellow-500 border-yellow-300 text-black shadow-lg shadow-yellow-500/50'
                        : comparedIndices.includes(index)
                        ? 'bg-red-500 border-red-300 text-white shadow-lg shadow-red-500/50'
                        : 'bg-gray-700 border-gray-500 text-gray-300'
                    )}
                    animate={{
                      scale: currentIndex === index ? 1.1 : 1,
                      y: currentIndex === index ? -8 : 0
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {value}
                  </motion.div>
                ))}
              </div>
              
              {/* Index Labels */}
              <div className="flex items-center space-x-2">
                {array.map((_, index) => (
                  <div
                    key={index}
                    className="w-16 text-center text-sm text-gray-400 font-mono"
                  >
                    [{index}]
                  </div>
                ))}
              </div>
            </div>

            {/* Current Step Info */}
            <AnimatePresence>
              {steps.length > 0 && currentStep < steps.length && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gray-800 rounded-lg p-4 max-w-md text-center"
                >
                  <p className="text-cyan-400 font-semibold">
                    Step {currentStep + 1} of {steps.length}
                  </p>
                  <p className="text-gray-300 mt-2">
                    {steps[currentStep]?.description}
                  </p>
                  {highlightedLine && (
                    <p className="text-yellow-400 text-sm mt-2">
                      → Line {highlightedLine} in code
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Result */}
            <AnimatePresence>
              {animationState === 'completed' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={clsx(
                    'mt-6 p-4 rounded-lg text-center font-semibold',
                    foundIndex !== -1
                      ? 'bg-green-900 text-green-300 border border-green-700'
                      : 'bg-red-900 text-red-300 border border-red-700'
                  )}
                >
                  {foundIndex !== -1
                    ? `Found ${target} at index ${foundIndex}!`
                    : `${target} not found in array`
                  }
                </motion.div>
              )}
            </AnimatePresence>

            {/* Legend */}
            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-gray-400">Currently Checking</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-gray-400">Already Checked</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-400">Found Target</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-700 rounded border border-gray-500"></div>
                <span className="text-gray-400">Unchecked</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for editor highlighting */}
      <style>{`
        .highlighted-line {
          background-color: rgba(255, 255, 0, 0.2) !important;
        }
        .highlighted-glyph {
          background-color: rgba(255, 255, 0, 0.5) !important;
        }
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          background: #06b6d4;
          border-radius: 50%;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          background: #06b6d4;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default AlgorithmPlayground;