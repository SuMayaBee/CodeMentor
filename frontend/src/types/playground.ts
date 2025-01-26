export type Language = {
    id: string;
    name: string;
    extension: string;
  }
  
  export const SUPPORTED_LANGUAGES: Language[] = [
    { id: 'python', name: 'Python', extension: 'py' },
    { id: 'javascript', name: 'JavaScript', extension: 'js' },
    { id: 'typescript', name: 'TypeScript', extension: 'ts' },
    { id: 'cpp', name: 'C++', extension: 'cpp' },
    { id: 'java', name: 'Java', extension: 'java' },
    { id: 'c', name: 'C', extension: 'c' },
  ];