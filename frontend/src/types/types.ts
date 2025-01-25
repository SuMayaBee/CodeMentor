export interface MaterialData {
  pdfs?: File[];
  slides?: File[];
  videos?: File[];
  weblinks?: string[];
  topic: string;    // Added topic
  question: string;
}
  export interface UploadResponse {
    answer: string;
    error?: string;
  }