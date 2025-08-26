// src/controllers/testController.js

import waterQualityService from '../services/waterQualityService.js';

export const test = (req, res) => {
  res.status(200).json({ message: "all good" });
};

export const startRecording = async (req, res) => {
  try {
    const { poolId, poolName, userId, userRole, testInitiated, timestamp } = req.body;
    
    // Your logic to start recording
    const result = await waterQualityService.startRecording({
      poolId,
      poolName, 
      userId,
      userRole,
      testInitiated,
      timestamp
    });
    
    res.status(200).json({ 
      message: "Recording started successfully", 
      data: result 
    });
  } catch (error) {
    console.error('Error starting recording:', error);
    res.status(500).json({ 
      message: "Failed to start recording", 
      error: error.message 
    });
  }
};

export const stopRecording = async (req, res) => {
  try {
    const { poolId, poolName, userId } = req.body;
    
    const result = await waterQualityService.stopRecording({
      poolId,
      poolName,
      userId
    });
    
    res.status(200).json({ 
      message: "Recording stopped successfully", 
      data: result 
    });
  } catch (error) {
    console.error('Error stopping recording:', error);
    res.status(500).json({ 
      message: "Failed to stop recording", 
      error: error.message 
    });
  }
};

export const saveTestData = async (req, res) => {
  try {
    const { poolId, poolName, data, testMode, userId, timestamp } = req.body;
    
    const result = await waterQualityService.saveTestData({
      poolId,
      poolName,
      data,
      testMode,
      userId,
      timestamp
    });
    
    res.status(201).json({ 
      message: "Test data saved successfully", 
      data: result 
    });
  } catch (error) {
    console.error('Error saving test data:', error);
    res.status(500).json({ 
      message: "Failed to save test data", 
      error: error.message 
    });
  }
};