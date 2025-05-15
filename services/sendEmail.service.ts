import { Resend } from "resend";
import { resendAPIKey } from "../config/env.js";
import { sendEmailType } from "../type.js";


if(!resendAPIKey) {
    console.error("Resend API key is not defined");
    throw new Error("Resend API key is not defined");
}
const resend = new Resend(resendAPIKey);

const sendEmail = async ({name, sendTo, subject, html, from}:sendEmailType)=>{

    try{
        const defaultFrom = "support@email.super-trader.xyz";
        const  {data, error} = await resend.emails.send({
            from: from || `${name || 'Support'} <${defaultFrom}>`,
            to: sendTo,
            subject: subject,
            html: html,
        })
        if(error){
            console.error("Error sending email:", error);
            throw new Error("Error sending email");
        }
        console.log("Email sent successfully:", data);
        return data;
    }catch (error: unknown){
        console.log("Error sending email:", error);
        let errorMessage = "Something went wrong";
        if(error instanceof Error){
            errorMessage = error.message;
        }
        console.error("Error sending email:", errorMessage);
        throw new Error(errorMessage);
    }

}


export default sendEmail;

// (async function (){
    
// })