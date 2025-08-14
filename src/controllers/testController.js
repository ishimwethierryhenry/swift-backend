import express from "express";

export const test = (req, res) => {
  res.status(200).json({ message: "all good" });
};
