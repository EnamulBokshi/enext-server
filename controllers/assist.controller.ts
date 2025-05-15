import { askQuestion } from "../services/askQuestion.js";
import { Request, Response } from "express";


export const getAssist = async (req: Request, res: Response) => {
  try {
    console.log("Request body:", req.body);
    console.log("Content-Type:", req.headers['content-type']);
    
    // Handle case where body might be undefined
    if (!req.body) {
      return res.status(400).json({ error: "Request body is missing" });
    }
    
    const { question } = req.body;
    
    // Validate question is provided
    if (!question) {
      return res.status(400).json({ error: "Question parameter is required" });
    }
    
    const response = await askQuestion(question);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error in getAssist:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

