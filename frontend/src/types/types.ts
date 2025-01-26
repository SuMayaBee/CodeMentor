export interface MaterialData {
  pdfs?: string[];
  weblinks?: string[];
  topic: string;
  question: string;
}

export interface TopicResponse {
  answer: string;
  error: string;
}

export interface Topic {
  title: string;
  subtopics?: string[];
}
export interface UploadResponse {
  path: string;
  fileName: string;
}


export interface TopicDetails {
    topic: string;
    materials: {
      pdfs?: File[];
      slides?: File[];
      videos?: File[];
      weblinks?: string[];
    };
  }
