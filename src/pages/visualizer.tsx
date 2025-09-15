import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Editor } from '@monaco-editor/react';
import clsx from 'clsx';
import NavBar from "../components/NavBar";

interface Step {
  type: 'compare' | 'found' | 'not_found';
  index: number;
  value?: number;
  target?: number;
  line: number;
  description: string;
}

export default function Visualizer() {
  // State management
  const [code, setCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(1);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const [animationState, setAnimationState] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');
  const [isConverted, setIsConverted] = useState<boolean>(false);
  const [newlyAddedIndices, setNewlyAddedIndices] = useState<number[]>([]);
  
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

  // Real-time code analysis - parse array and target from code changes
  useEffect(() => {
    if (code) {
      // Parse array from code
      const arrayMatch = code.match(/\{([^}]+)\}/);
      if (arrayMatch) {
        const detectedArray = arrayMatch[1].split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        if (detectedArray.length > 0 && JSON.stringify(detectedArray) !== JSON.stringify(array)) {
          setArray(detectedArray);
          // Reset animation when array changes
          reset();
        }
      }
      
      // Parse target from code
      const targetMatch = code.match(/target\s*=\s*(\d+)/);
      if (targetMatch) {
        const detectedTarget = parseInt(targetMatch[1]);
        if (!isNaN(detectedTarget) && detectedTarget !== target) {
          setTarget(detectedTarget);
          // Reset animation when target changes
          reset();
        }
      }
    }
  }, [code]);

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
    // Use current steps if available, otherwise generate default steps
    const algorithmSteps = steps.length > 0 ? steps : generateSteps();
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
    intervalRef.current = window.setTimeout(() => {
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
    // Only clear steps if they weren't converted from user code
    if (!isConverted) {
      setSteps([]);
    }
    clearHighlights();
    setHighlightedLine(null);
  };

  // Analyze user code to generate dynamic steps
  const analyzeCodeToSteps = (code: string): Step[] => {
    const steps: Step[] = [];
    const codeLines = code.split('\n');
    
    try {
      // Find array declaration
      let arrayPattern = /(?:int\[\]\s+)?(\w+)\s*=\s*\{([^}]+)\}/;
      let arrayMatch = code.match(arrayPattern);
      
      // Find target variable
      let targetPattern = /(?:int\s+)?target\s*=\s*(\d+)/;
      let targetMatch = code.match(targetPattern);
      
      // Find loop pattern
      let loopPattern = /for\s*\(\s*int\s+(\w+)\s*=\s*0\s*;\s*\1\s*<\s*\w+\.length\s*;\s*\1\+\+\s*\)/;
      let loopMatch = code.match(loopPattern);
      
      // Find comparison pattern
      let comparisonPattern = /if\s*\(\s*\w+\[\w+\]\s*==\s*target\s*\)/;
      let comparisonLineIndex = -1;
      
      // Find return patterns
      let returnNotFoundPattern = /return\s+-1/;
      
      for (let i = 0; i < codeLines.length; i++) {
        if (comparisonPattern.test(codeLines[i])) {
          comparisonLineIndex = i;
          break;
        }
      }
      
      if (!arrayMatch || !targetMatch || !loopMatch || comparisonLineIndex === -1) {
        throw new Error("Could not parse essential code elements");
      }
      
      // Extract array values
      const arrayValues = arrayMatch[2].split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
      const targetValue = parseInt(targetMatch[1]);
      
      // Generate initialization step
      steps.push({
        type: 'compare',
        index: 0,
        target: targetValue,
        line: comparisonLineIndex + 1,
        description: 'Initialize search - starting at index 0'
      });
      
      // Generate comparison steps for each array element
      for (let i = 0; i < arrayValues.length; i++) {
        if (arrayValues[i] === targetValue) {
          steps.push({
            type: 'found',
            index: i,
            value: arrayValues[i],
            target: targetValue,
            line: comparisonLineIndex + 1,
            description: `Found target ${targetValue} at index ${i}!`
          });
          break;
        } else {
          steps.push({
            type: 'compare',
            index: i,
            value: arrayValues[i],
            target: targetValue,
            line: comparisonLineIndex + 1,
            description: `Comparing arr[${i}] (${arrayValues[i]}) with target (${targetValue})`
          });
        }
      }
      
      // Add not found step if target wasn't found
      const foundStep = steps.find(step => step.type === 'found');
      if (!foundStep) {
        steps.push({
          type: 'not_found',
          index: arrayValues.length,
          target: targetValue,
          line: codeLines.findIndex(line => returnNotFoundPattern.test(line)) + 1,
          description: `Target ${targetValue} not found in array`
        });
      }
      
      return steps;
    } catch (error) {
      console.error('Code analysis failed:', error);
      throw error;
    }
  };

  // Convert button handler
  const convertCode = () => {
    try {
      const newSteps = analyzeCodeToSteps(code);
      
      // Extract and update array and target from the code
      const arrayMatch = code.match(/\{([^}]+)\}/);
      const targetMatch = code.match(/target\s*=\s*(\d+)/);
      
      if (arrayMatch) {
        const detectedArray = arrayMatch[1].split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        if (detectedArray.length > 0) {
          // Track newly added elements for animation
          const oldLength = array.length;
          const newIndices = detectedArray.length > oldLength ? 
            Array.from({ length: detectedArray.length - oldLength }, (_, i) => oldLength + i) : [];
          
          setArray(detectedArray);
          setNewlyAddedIndices(newIndices);
          
          // Clear newly added indices after animation
          setTimeout(() => setNewlyAddedIndices([]), 2000);
          
          console.log('Updated array to:', detectedArray);
          if (newIndices.length > 0) {
            console.log('Added new elements at indices:', newIndices);
          }
        }
      }
      
      if (targetMatch) {
        const detectedTarget = parseInt(targetMatch[1]);
        if (!isNaN(detectedTarget)) {
          setTarget(detectedTarget);
          console.log('Updated target to:', detectedTarget);
        }
      }
      
      setSteps(newSteps);
      setIsConverted(true);
      reset(); // Reset visualization state
      
      // Show success message with array info
      console.log(`Code converted successfully! Generated ${newSteps.length} steps for array [${array.join(', ')}] with target ${target}`);
    } catch (error) {
      console.error('Conversion failed:', error);
      // Fallback to default steps but still try to update array/target
      const arrayMatch = code.match(/\{([^}]+)\}/);
      const targetMatch = code.match(/target\s*=\s*(\d+)/);
      
      if (arrayMatch) {
        const detectedArray = arrayMatch[1].split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        if (detectedArray.length > 0) {
          // Track newly added elements for animation
          const oldLength = array.length;
          const newIndices = detectedArray.length > oldLength ? 
            Array.from({ length: detectedArray.length - oldLength }, (_, i) => oldLength + i) : [];
          
          setArray(detectedArray);
          setNewlyAddedIndices(newIndices);
          
          // Clear newly added indices after animation
          setTimeout(() => setNewlyAddedIndices([]), 2000);
        }
      }
      
      if (targetMatch) {
        const detectedTarget = parseInt(targetMatch[1]);
        if (!isNaN(detectedTarget)) {
          setTarget(detectedTarget);
        }
      }
      
      setSteps(generateSteps());
      setIsConverted(false);
      // Show error message (you can replace with toast library)
      alert('Could not analyze code structure. Updated array/target values but using default linear search steps.');
    }
  };

  const autoDetect = () => {
    // This is now automatic via useEffect, but keeping for manual trigger
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
    reset();
  };

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-900">
      <NavBar />
      
      <div className="h-screen flex flex-col bg-gray-900 text-white">
        {/* Header Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 bg-gray-800 border-b border-gray-700 gap-4">
          <div className="flex items-center space-x-2 lg:space-x-4">
            <h1 className="text-lg lg:text-xl font-bold text-cyan-400">DSA Visualizer</h1>
            <span className="text-xs lg:text-sm text-gray-400 hidden sm:inline">Linear Search</span>
            {isConverted && (
              <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                Custom
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-2 lg:space-x-3">
            {/* Control Buttons */}
            <button
              onClick={convertCode}
              className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 font-medium text-sm"
            >
              Convert
            </button>
            <button
              onClick={runAlgorithm}
              disabled={isRunning && !isPaused}
              className={clsx(
                'px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-sm',
                isRunning && !isPaused
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-green-500/25'
              )}
            >
              {isRunning && !isPaused ? 'Running' : 'Run'}
            </button>
            
            <button
              onClick={autoDetect}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/25 text-sm"
            >
              Re-analyze
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
        <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
          {/* Left Panel - Code Editor */}
          <div className="w-full lg:w-[48%] flex flex-col bg-gray-900 border-b lg:border-b-0 lg:border-r border-gray-700 h-1/2 lg:h-full">
            <div className="p-3 bg-gray-800 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-gray-200">Live Code Editor</h2>
              <p className="text-sm text-gray-400 hidden sm:block">Edit code - changes auto-detected!</p>
            </div>
            
            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                defaultLanguage="java"
                value={code}
                onChange={(value) => setCode(value || '')}
                onMount={handleEditorDidMount}
                options={{
                  fontSize: window.innerWidth < 768 ? 12 : 14,
                  minimap: { enabled: window.innerWidth >= 1024 },
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
          <div className="w-full lg:w-[52%] flex flex-col bg-gradient-to-br from-gray-900 to-black h-1/2 lg:h-full">
            {/* Visualization Header */}
            <div className="p-4 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-200">Algorithm Visualization</h2>
                <div className="flex items-center space-x-2">
                  <div className="text-xs text-green-400 flex items-center space-x-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span>Live Analysis</span>
                  </div>
                </div>
              </div>
              
              {/* Algorithm Info */}
              <div className="mt-3 p-3 bg-gray-900 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-400">Target:</span>
                    <span className="text-cyan-400 font-mono text-lg font-bold">{target}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-400">Array Size:</span>
                    <span className="text-yellow-400 font-mono">{array.length}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-400">Algorithm:</span>
                    <span className="text-purple-400 font-semibold">Linear Search</span>
                  </div>
                </div>
                
                {animationState !== 'idle' && (
                  <div className="mt-2 pt-2 border-t border-gray-700 flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      Progress: {currentStep + 1} / {steps.length}
                    </span>
                    <span className="text-gray-500">
                      Time Complexity: O(n)
                    </span>
                    <span className={clsx(
                      "px-2 py-1 rounded-full font-medium",
                      animationState === 'running' ? 'bg-green-900 text-green-300' :
                      animationState === 'paused' ? 'bg-yellow-900 text-yellow-300' :
                      animationState === 'completed' ? 'bg-blue-900 text-blue-300' :
                      'bg-gray-700 text-gray-400'
                    )}>
                      {animationState.charAt(0).toUpperCase() + animationState.slice(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 p-6 flex flex-col justify-center items-center relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div key={i} className="border border-cyan-400/20"></div>
                  ))}
                </div>
              </div>
              
              {/* Array Title */}
              <div className="mb-6 text-center">
                <h3 className="text-xl font-bold text-cyan-400 mb-2">Array Elements</h3>
                <p className="text-sm text-gray-400">
                  {foundIndex !== -1 ? 
                    `Target found at index ${foundIndex}!` : 
                    animationState === 'completed' ? 
                    'Target not found in array' :
                    'Searching for target element...'
                  }
                </p>
              </div>

              {/* Array Visualization */}
              <div className="mb-8 relative">
                {/* Array Container */}
                <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3 mb-4 lg:mb-6 flex-wrap justify-center p-2 sm:p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                  {array.map((value, index) => (
                    <motion.div
                      key={`${index}-${value}`} // Include value in key to trigger re-animation when value changes
                      className={clsx(
                        'relative flex items-center justify-center font-bold rounded-lg lg:rounded-xl border-2 transition-all duration-500 m-0.5 sm:m-1 cursor-pointer',
                        'w-12 h-12 text-sm sm:w-16 sm:h-16 sm:text-base lg:w-20 lg:h-20 lg:text-xl',
                        foundIndex === index
                          ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-300 text-white shadow-2xl shadow-green-500/50'
                          : currentIndex === index
                          ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-300 text-black shadow-2xl shadow-yellow-500/50'
                          : comparedIndices.includes(index)
                          ? 'bg-gradient-to-br from-red-400 to-red-600 border-red-300 text-white shadow-2xl shadow-red-500/50'
                          : newlyAddedIndices.includes(index)
                          ? 'bg-gradient-to-br from-purple-400 to-purple-600 border-purple-300 text-white shadow-2xl shadow-purple-500/50'
                          : 'bg-gradient-to-br from-gray-600 to-gray-800 border-gray-500 text-gray-200 hover:border-gray-400'
                      )}
                      initial={newlyAddedIndices.includes(index) ? { scale: 0, rotateY: 180, opacity: 0 } : false}
                      animate={{
                        scale: currentIndex === index ? (window.innerWidth < 640 ? 1.1 : 1.15) : 
                               foundIndex === index ? 1.1 : 
                               newlyAddedIndices.includes(index) ? 1.05 : 1,
                        y: currentIndex === index ? (window.innerWidth < 640 ? -8 : -12) : 
                           foundIndex === index ? (window.innerWidth < 640 ? -4 : -8) : 
                           newlyAddedIndices.includes(index) ? -4 : 0,
                        rotateY: currentIndex === index ? 5 : 0,
                        opacity: 1
                      }}
                      whileHover={{ scale: 1.05, y: -4 }}
                      transition={{ 
                        duration: newlyAddedIndices.includes(index) ? 0.8 : 0.4, 
                        type: "spring", 
                        stiffness: 200,
                        damping: 15
                      }}
                    >
                      {/* Glow effect for active elements */}
                      {(currentIndex === index || foundIndex === index) && (
                        <motion.div
                          className="absolute inset-0 rounded-lg lg:rounded-xl"
                          animate={{
                            boxShadow: currentIndex === index ? 
                              '0 0 20px rgba(234, 179, 8, 0.6), 0 0 40px rgba(234, 179, 8, 0.3)' :
                              '0 0 20px rgba(34, 197, 94, 0.6), 0 0 40px rgba(34, 197, 94, 0.3)'
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                      
                      {/* Special glow for newly added elements */}
                      {newlyAddedIndices.includes(index) && (
                        <motion.div
                          className="absolute inset-0 rounded-lg lg:rounded-xl"
                          animate={{
                            boxShadow: [
                              '0 0 0px rgba(147, 51, 234, 0.8)',
                              '0 0 30px rgba(147, 51, 234, 0.8), 0 0 60px rgba(147, 51, 234, 0.4)',
                              '0 0 15px rgba(147, 51, 234, 0.6), 0 0 30px rgba(147, 51, 234, 0.3)',
                              '0 0 0px rgba(147, 51, 234, 0.4)'
                            ]
                          }}
                          transition={{ 
                            duration: 2,
                            times: [0, 0.3, 0.7, 1],
                            ease: "easeInOut"
                          }}
                        />
                      )}
                      
                      <span className="relative z-10">{value}</span>
                      
                      {/* New element indicator */}
                      {newlyAddedIndices.includes(index) && (
                        <motion.div
                          className="absolute -top-2 -left-2 w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center text-xs font-bold text-black"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                        >
                          ✨
                        </motion.div>
                      )}
                      
                      {/* Target indicator */}
                      {value === target && (
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
                </div>
                
                {/* Index Labels */}
                <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3 flex-wrap justify-center">
                  {array.map((_, index) => (
                    <motion.div
                      key={index}
                      className={clsx(
                        "text-center font-mono rounded transition-all duration-300 m-0.5 sm:m-1 p-1",
                        "w-12 text-xs sm:w-16 sm:text-sm lg:w-20",
                        currentIndex === index 
                          ? "text-yellow-400 bg-yellow-900/30 font-bold" 
                          : foundIndex === index
                          ? "text-green-400 bg-green-900/30 font-bold"
                          : comparedIndices.includes(index)
                          ? "text-red-400 bg-red-900/30"
                          : "text-gray-500"
                      )}
                      animate={{
                        scale: currentIndex === index ? 1.1 : 1
                      }}
                    >
                      [{index}]
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Current Step Info */}
              <AnimatePresence mode="wait">
                {steps.length > 0 && currentStep < steps.length && (
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -30, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 max-w-lg text-center border border-gray-700 shadow-2xl"
                  >
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-black font-bold">
                        {currentStep + 1}
                      </div>
                      <span className="text-gray-400">of</span>
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-gray-300 font-bold">
                        {steps.length}
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-semibold text-cyan-400 mb-2">
                      {steps[currentStep]?.type === 'found' ? '🎉 Target Found!' :
                       steps[currentStep]?.type === 'not_found' ? '❌ Not Found' :
                       '🔍 Searching...'}
                    </h4>
                    
                    <p className="text-gray-200 text-base leading-relaxed mb-3">
                      {steps[currentStep]?.description}
                    </p>
                    
                    {highlightedLine && (
                      <div className="flex items-center justify-center space-x-2 text-sm">
                        <span className="text-yellow-400">📍</span>
                        <span className="text-yellow-400">
                          Highlighting line {highlightedLine} in code
                        </span>
                      </div>
                    )}
                    
                    {/* Progress Bar */}
                    <div className="mt-4 bg-gray-700 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Result */}
              <AnimatePresence>
                {animationState === 'completed' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 200, 
                      damping: 20,
                      delay: 0.2 
                    }}
                    className={clsx(
                      'mt-8 p-6 rounded-xl text-center font-bold border-2 shadow-2xl relative overflow-hidden',
                      foundIndex !== -1
                        ? 'bg-gradient-to-br from-green-800 to-green-900 text-green-200 border-green-500 shadow-green-500/30'
                        : 'bg-gradient-to-br from-red-800 to-red-900 text-red-200 border-red-500 shadow-red-500/30'
                    )}
                  >
                    {/* Animated background effect */}
                    <motion.div
                      className={clsx(
                        "absolute inset-0 opacity-20",
                        foundIndex !== -1 ? "bg-green-400" : "bg-red-400"
                      )}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.3, 0.1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    
                    <div className="relative z-10">
                      <div className="text-4xl mb-2">
                        {foundIndex !== -1 ? '🎉' : '❌'}
                      </div>
                      <h3 className="text-xl mb-2">
                        {foundIndex !== -1 ? 'Target Found!' : 'Target Not Found'}
                      </h3>
                      <p className="text-lg">
                        {foundIndex !== -1
                          ? `Element ${target} found at index ${foundIndex}`
                          : `Element ${target} is not present in the array`
                        }
                      </p>
                      
                      {foundIndex !== -1 && (
                        <div className="mt-4 text-sm opacity-80">
                          <p>Comparisons made: {comparedIndices.length + 1}</p>
                          <p>Time taken: {((comparedIndices.length + 1) / speed).toFixed(1)}s</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Enhanced Legend */}
              <div className="mt-8 bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <h4 className="text-center text-gray-300 font-semibold mb-3">Visual Legend</h4>
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded border-2 border-yellow-300 shadow-lg"></div>
                    <span className="text-gray-300">Currently Checking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gradient-to-br from-red-400 to-red-600 rounded border-2 border-red-300 shadow-lg"></div>
                    <span className="text-gray-300">Already Checked</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-green-600 rounded border-2 border-green-300 shadow-lg"></div>
                    <span className="text-gray-300">Target Found</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-purple-600 rounded border-2 border-purple-300 shadow-lg relative">
                      <div className="absolute -top-1 -left-1 w-3 h-3 bg-purple-400 rounded-full flex items-center justify-center text-xs">✨</div>
                    </div>
                    <span className="text-gray-300">Newly Added</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gradient-to-br from-gray-600 to-gray-800 rounded border-2 border-gray-500"></div>
                    <span className="text-gray-300">Unchecked</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-cyan-400 rounded-full flex items-center justify-center text-xs">🎯</div>
                    <span className="text-gray-300">Target Value</span>
                  </div>
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
    </div>
  );
}
