const verificationEmailTemplate = ({name, link}:{name:string,link:string}) =>{
    return `
   <p> Thank you for registration </p>
    <p> Hello ${name}, </p>
    <p> Please click the link below to verify your email address: </p>
    <a href="${link}" style="color:white; background: blue; padding: 10px 16px; margin-top: 10px;  border-radius: 20px">Verify Email</a>
    <p> If you did not create an account, no further action is required. </p>
    <p> ${link} </p>
    <p> Thank you, </p>
    <p> The Team </p>
    <p> This is an auto-generated email, please do not reply. </p>
    <p> If you have any questions, please contact us at enext@gmail.com</p>
`
}

export default verificationEmailTemplate;