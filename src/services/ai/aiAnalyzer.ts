// AI Code Analyzer for Algorithm Visualization
// This module simulates AI analysis of code to identify algorithms and generate visualization steps

export interface AlgorithmStep {
  type: 'compare' | 'found' | 'not_found' | 'move' | 'swap' | 'assign';
  currentIndex: number;
  targetValue?: number;
  description: string;
  highlightLine?: number;
  secondaryIndex?: number; // For swaps, comparisons between two elements
  compareValue?: number; // Value being compared
}

export interface AIAnalysisResult {
  array: number[];
  target?: number;
  algorithmType: 'linear_search' | 'binary_search' | 'bubble_sort' | 'selection_sort' | 'insertion_sort' | 'unknown';
  steps: AlgorithmStep[];
  output?: string; // Simulated execution output
  complexity?: {
    time: string;
    space: string;
  };
  language: 'javascript' | 'java' | 'python' | 'unknown';
}

export class AIAnalyzer {
  /**
   * Main AI analysis function that processes code input
   * @param code - Raw code string from the editor
   * @returns AIAnalysisResult with algorithm details and visualization steps
   */
  static analyzeCode(code: string): AIAnalysisResult | null {
    try {
      console.log('🤖 AI Analyzer: Starting code analysis...');
      
      // Step 1: Detect programming language
      const language = this.detectLanguage(code);
      console.log(`📝 Detected language: ${language}`);
      
      // Step 2: Extract data structures (arrays, targets)
      const dataStructures = this.extractDataStructures(code);
      if (!dataStructures.array) {
        throw new Error('No array data structure found in code');
      }
      
      // Step 3: Identify algorithm type using AI-like pattern matching
      const algorithmType = this.identifyAlgorithm(code);
      console.log(`🔍 Identified algorithm: ${algorithmType}`);
      
      // Step 4: Generate visualization steps
      const steps = this.generateVisualizationSteps(
        dataStructures.array, 
        dataStructures.target, 
        algorithmType
      );
      
      // Step 5: Simulate code execution for output
      const output = this.simulateExecution(
        dataStructures.array, 
        dataStructures.target, 
        algorithmType, 
        language
      );
      
      // Step 6: Calculate complexity
      const complexity = this.calculateComplexity(algorithmType);
      
      const result: AIAnalysisResult = {
        array: dataStructures.array,
        target: dataStructures.target,
        algorithmType,
        steps,
        output,
        complexity,
        language
      };
      
      console.log('✅ AI Analysis completed successfully');
      return result;
      
    } catch (error) {
      console.error('❌ AI Analysis failed:', error);
      return null;
    }
  }

  /**
   * Detect programming language from code patterns
   */
  private static detectLanguage(code: string): 'javascript' | 'java' | 'python' | 'unknown' {
    const lowerCode = code.toLowerCase();
    
    // Java patterns
    if (lowerCode.includes('public class') || 
        lowerCode.includes('public static') || 
        lowerCode.includes('system.out.println') ||
        lowerCode.includes('int[]')) {
      return 'java';
    }
    
    // Python patterns
    if (lowerCode.includes('def ') || 
        lowerCode.includes('print(') || 
        lowerCode.includes('range(') ||
        lowerCode.includes('len(')) {
      return 'python';
    }
    
    // JavaScript patterns (default)
    if (lowerCode.includes('function') || 
        lowerCode.includes('const') || 
        lowerCode.includes('let') ||
        lowerCode.includes('console.log')) {
      return 'javascript';
    }
    
    return 'unknown';
  }

  /**
   * Extract arrays and target values from code
   */
  private static extractDataStructures(code: string): { array: number[] | null, target?: number } {
    // Enhanced regex patterns for different languages
    const arrayPatterns = [
      // JavaScript: const arr = [1,2,3] or let numbers = [4,5,6]
      /(?:const|let|var)\s+\w+\s*=\s*\[([^\]]+)\]/g,
      // Java: int[] arr = {1,2,3} or new int[]{1,2,3}
      /\{\s*([^}]+)\s*\}/g,
      // Python: arr = [1,2,3]
      /\w+\s*=\s*\[([^\]]+)\]/g,
      // Generic array pattern
      /\[([^\]]+)\]/g
    ];

    let array: number[] | null = null;
    
    for (const pattern of arrayPatterns) {
      const matches = Array.from(code.matchAll(pattern));
      for (const match of matches) {
        const values = match[1]
          .split(',')
          .map(val => parseInt(val.trim()))
          .filter(val => !isNaN(val));
        
        if (values.length > 0) {
          array = values;
          break;
        }
      }
      if (array) break;
    }

    // Extract target value
    const targetPatterns = [
      /(?:const|let|var)\s+target\s*=\s*(\d+)/,
      /target\s*=\s*(\d+)/,
      /find\s*\(\s*(\d+)\s*\)/,
      /search\s*\(\s*\w+\s*,\s*(\d+)\s*\)/
    ];

    let target: number | undefined;
    for (const pattern of targetPatterns) {
      const match = code.match(pattern);
      if (match) {
        target = parseInt(match[1]);
        break;
      }
    }

    return { array, target };
  }

  /**
   * AI-powered algorithm identification using pattern matching
   */
  private static identifyAlgorithm(code: string): AIAnalysisResult['algorithmType'] {
    const lowerCode = code.toLowerCase();
    
    // Advanced pattern matching for different algorithms
    const patterns = {
      bubble_sort: [
        'bubble',
        'for.*for.*swap',
        'for.*for.*temp',
        'for.*for.*\\[j\\].*\\[j\\+1\\]'
      ],
      selection_sort: [
        'selection',
        'min.*index',
        'for.*for.*min',
        'smallest.*index'
      ],
      insertion_sort: [
        'insertion',
        'while.*shift',
        'insert.*sorted',
        'key.*while'
      ],
      binary_search: [
        'binary',
        'while.*mid',
        'left.*right.*mid',
        'divide.*conquer',
        'log.*search'
      ],
      linear_search: [
        'linear',
        'for.*length.*return',
        'for.*if.*target.*return',
        'sequential.*search'
      ]
    };

    // Score each algorithm based on pattern matches
    const scores: Record<string, number> = {};
    
    for (const [algorithm, algorithmPatterns] of Object.entries(patterns)) {
      scores[algorithm] = 0;
      for (const pattern of algorithmPatterns) {
        const regex = new RegExp(pattern, 'i');
        if (regex.test(lowerCode)) {
          scores[algorithm]++;
        }
      }
    }

    // Find algorithm with highest score
    const bestMatch = Object.entries(scores).reduce((a, b) => 
      scores[a[0]] > scores[b[0]] ? a : b
    );

    if (bestMatch[1] > 0) {
      return bestMatch[0] as AIAnalysisResult['algorithmType'];
    }

    // Fallback pattern matching
    if (lowerCode.includes('for') && lowerCode.includes('if') && lowerCode.includes('return')) {
      return 'linear_search';
    }

    return 'unknown';
  }

  /**
   * Generate detailed visualization steps for different algorithms
   */
  private static generateVisualizationSteps(
    array: number[], 
    target: number | undefined, 
    algorithmType: AIAnalysisResult['algorithmType']
  ): AlgorithmStep[] {
    switch (algorithmType) {
      case 'linear_search':
        return this.generateLinearSearchSteps(array, target);
      case 'binary_search':
        return this.generateBinarySearchSteps(array, target);
      case 'bubble_sort':
        return this.generateBubbleSortSteps(array);
      case 'selection_sort':
        return this.generateSelectionSortSteps(array);
      case 'insertion_sort':
        return this.generateInsertionSortSteps(array);
      default:
        return this.generateLinearSearchSteps(array, target);
    }
  }

  private static generateLinearSearchSteps(array: number[], target?: number): AlgorithmStep[] {
    const steps: AlgorithmStep[] = [];
    if (!target) return steps;

    for (let i = 0; i < array.length; i++) {
      steps.push({
        type: 'compare',
        currentIndex: i,
        targetValue: target,
        compareValue: array[i],
        description: `Comparing arr[${i}] = ${array[i]} with target = ${target}`,
        highlightLine: 2
      });

      if (array[i] === target) {
        steps.push({
          type: 'found',
          currentIndex: i,
          targetValue: target,
          description: `✅ Found target ${target} at index ${i}!`,
          highlightLine: 3
        });
        break;
      }
    }

    if (!steps.some(step => step.type === 'found')) {
      steps.push({
        type: 'not_found',
        currentIndex: -1,
        targetValue: target,
        description: `❌ Target ${target} not found in array`,
        highlightLine: 6
      });
    }

    return steps;
  }

  private static generateBinarySearchSteps(array: number[], target?: number): AlgorithmStep[] {
    const steps: AlgorithmStep[] = [];
    if (!target) return steps;

    let left = 0;
    let right = array.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      steps.push({
        type: 'compare',
        currentIndex: mid,
        targetValue: target,
        compareValue: array[mid],
        description: `Checking middle: arr[${mid}] = ${array[mid]} vs target = ${target}`,
        highlightLine: 3
      });

      if (array[mid] === target) {
        steps.push({
          type: 'found',
          currentIndex: mid,
          targetValue: target,
          description: `✅ Found target ${target} at index ${mid}!`,
          highlightLine: 4
        });
        break;
      } else if (array[mid] < target) {
        left = mid + 1;
        steps.push({
          type: 'move',
          currentIndex: mid,
          description: `Target > ${array[mid]}, search right half [${left}, ${right}]`,
          highlightLine: 5
        });
      } else {
        right = mid - 1;
        steps.push({
          type: 'move',
          currentIndex: mid,
          description: `Target < ${array[mid]}, search left half [${left}, ${right}]`,
          highlightLine: 7
        });
      }
    }

    if (!steps.some(step => step.type === 'found')) {
      steps.push({
        type: 'not_found',
        currentIndex: -1,
        targetValue: target,
        description: `❌ Target ${target} not found in sorted array`,
        highlightLine: 9
      });
    }

    return steps;
  }

  private static generateBubbleSortSteps(array: number[]): AlgorithmStep[] {
    const steps: AlgorithmStep[] = [];
    const arr = [...array];

    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        steps.push({
          type: 'compare',
          currentIndex: j,
          secondaryIndex: j + 1,
          compareValue: arr[j],
          description: `Compare arr[${j}] = ${arr[j]} with arr[${j + 1}] = ${arr[j + 1]}`,
          highlightLine: 3
        });

        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          steps.push({
            type: 'swap',
            currentIndex: j,
            secondaryIndex: j + 1,
            description: `🔄 Swap: ${arr[j + 1]} ↔ ${arr[j]}`,
            highlightLine: 4
          });
        }
      }
    }

    return steps;
  }

  private static generateSelectionSortSteps(array: number[]): AlgorithmStep[] {
    const steps: AlgorithmStep[] = [];
    const arr = [...array];

    for (let i = 0; i < arr.length - 1; i++) {
      let minIdx = i;
      
      steps.push({
        type: 'assign',
        currentIndex: i,
        description: `Starting pass ${i + 1}, assume min at index ${i}`,
        highlightLine: 2
      });

      for (let j = i + 1; j < arr.length; j++) {
        steps.push({
          type: 'compare',
          currentIndex: j,
          secondaryIndex: minIdx,
          description: `Compare arr[${j}] = ${arr[j]} with current min arr[${minIdx}] = ${arr[minIdx]}`,
          highlightLine: 4
        });

        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          steps.push({
            type: 'assign',
            currentIndex: j,
            description: `New minimum found at index ${j}`,
            highlightLine: 5
          });
        }
      }

      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        steps.push({
          type: 'swap',
          currentIndex: i,
          secondaryIndex: minIdx,
          description: `🔄 Swap minimum ${arr[i]} to position ${i}`,
          highlightLine: 8
        });
      }
    }

    return steps;
  }

  private static generateInsertionSortSteps(array: number[]): AlgorithmStep[] {
    const steps: AlgorithmStep[] = [];
    const arr = [...array];

    for (let i = 1; i < arr.length; i++) {
      const key = arr[i];
      let j = i - 1;

      steps.push({
        type: 'assign',
        currentIndex: i,
        description: `Insert arr[${i}] = ${key} into sorted portion`,
        highlightLine: 3
      });

      while (j >= 0 && arr[j] > key) {
        steps.push({
          type: 'compare',
          currentIndex: j,
          compareValue: key,
          description: `Compare arr[${j}] = ${arr[j]} > key = ${key}`,
          highlightLine: 5
        });

        arr[j + 1] = arr[j];
        steps.push({
          type: 'move',
          currentIndex: j + 1,
          description: `Shift arr[${j}] = ${arr[j]} one position right`,
          highlightLine: 6
        });
        j--;
      }

      arr[j + 1] = key;
      steps.push({
        type: 'assign',
        currentIndex: j + 1,
        description: `Place key ${key} at position ${j + 1}`,
        highlightLine: 8
      });
    }

    return steps;
  }

  /**
   * Simulate code execution and generate output
   */
  private static simulateExecution(
    array: number[], 
    target: number | undefined, 
    algorithmType: AIAnalysisResult['algorithmType'],
    language: string
  ): string {
    try {
      switch (algorithmType) {
        case 'linear_search':
          if (target !== undefined) {
            const result = array.indexOf(target);
            const langOutput = language === 'java' 
              ? result !== -1 ? `Element found at index: ${result}` : 'Element not found'
              : language === 'python'
              ? result !== -1 ? `Element found at index: ${result}` : 'Element not found'
              : result !== -1 ? `Element found at index: ${result}` : 'Element not found';
            return langOutput;
          }
          break;
          
        case 'binary_search':
          if (target !== undefined) {
            const sortedArray = [...array].sort((a, b) => a - b);
            let left = 0, right = sortedArray.length - 1;
            while (left <= right) {
              const mid = Math.floor((left + right) / 2);
              if (sortedArray[mid] === target) return `Element found at index: ${mid}`;
              else if (sortedArray[mid] < target) left = mid + 1;
              else right = mid - 1;
            }
            return 'Element not found';
          }
          break;
          
        case 'bubble_sort':
        case 'selection_sort':
        case 'insertion_sort':
          const sorted = [...array].sort((a, b) => a - b);
          return `Sorted array: [${sorted.join(', ')}]`;
          
        default:
          return 'Code executed successfully ✅';
      }
      return 'Code executed successfully ✅';
    } catch (error) {
      return `⚠️ Execution error: ${error}`;
    }
  }

  /**
   * Calculate time and space complexity
   */
  private static calculateComplexity(algorithmType: AIAnalysisResult['algorithmType']): { time: string, space: string } {
    const complexities = {
      linear_search: { time: 'O(n)', space: 'O(1)' },
      binary_search: { time: 'O(log n)', space: 'O(1)' },
      bubble_sort: { time: 'O(n²)', space: 'O(1)' },
      selection_sort: { time: 'O(n²)', space: 'O(1)' },
      insertion_sort: { time: 'O(n²)', space: 'O(1)' },
      unknown: { time: 'Unknown', space: 'Unknown' }
    };

    return complexities[algorithmType] || complexities.unknown;
  }
}