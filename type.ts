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
export interface listItemType {
    id: string;
    name: string;
    image: string;
    category: string;
    subCategory: string;
    unit: string;
    stock: number;
    price: number;
    discount: number;
    description: string;
    more_details: string[];
}

export interface ProductDetails {
    name: string;
    image: string;
}

export interface OrderPayload {
    userId: string;
    orderId: string;
    productId: string;
    product_details: ProductDetails;
    paymentId: string;
    payment_status: string;
    delivery_address: string;
    subTotalAmt: number;
    totalAmt: number;
}