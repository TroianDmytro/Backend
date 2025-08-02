export interface HomeworkFile {
    filename: string;
    original_name: string;
    data: string; // Base64
    size_bytes: number;
    mime_type: string;
    uploaded_at: Date;
}

export interface DetailedFeedback {
    criteria: string;
    score: number;
    comment?: string;
}

export interface HomeworkStatistics {
    total_submissions: number;
    submitted: number;
    in_review: number;
    reviewed: number;
    returned_for_revision: number;
    average_score: number;
    on_time_submissions: number;
    late_submissions: number;
}

export interface DownloadFileResponse {
    filename: string;
    data: Buffer;
    mimeType: string;
}