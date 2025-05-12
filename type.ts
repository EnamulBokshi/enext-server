export interface sendEmailType {
    sendTo: string;
    subject: string;
    html: string;
    name: string;
    from?: string;
    replyTo?: string;
    cc?: string;
    bcc?: string;
    attachments?: string[];
    text?: string;
    
}