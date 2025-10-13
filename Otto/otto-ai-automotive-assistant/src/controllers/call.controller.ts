import { Request, Response } from 'express';
import { CallService } from '../services/call.service';

// Create a new call record
export const createCall = async (req: Request, res: Response) => {
    try {
        const callData = req.body;
        const newCall = await CallService.createCall(callData);
        res.status(201).json(newCall);
    } catch (error) {
        res.status(500).json({ message: 'Error creating call record', error });
    }
};

// Get all call records
export const getAllCalls = async (req: Request, res: Response) => {
    try {
        const calls = await CallService.getAllCalls();
        res.status(200).json(calls);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving call records', error });
    }
};

// Get a specific call record by ID
export const getCallById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const call = await CallService.getCallById(id);
        if (!call) {
            return res.status(404).json({ message: 'Call record not found' });
        }
        res.status(200).json(call);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving call record', error });
    }
};

// Update a call record
export const updateCall = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const callData = req.body;
        const updatedCall = await CallService.updateCall(id, callData);
        if (!updatedCall) {
            return res.status(404).json({ message: 'Call record not found' });
        }
        res.status(200).json(updatedCall);
    } catch (error) {
        res.status(500).json({ message: 'Error updating call record', error });
    }
};

// Delete a call record
export const deleteCall = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedCall = await CallService.deleteCall(id);
        if (!deletedCall) {
            return res.status(404).json({ message: 'Call record not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting call record', error });
    }
};