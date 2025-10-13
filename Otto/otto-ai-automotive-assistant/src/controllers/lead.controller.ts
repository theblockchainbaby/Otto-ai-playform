import { Request, Response } from 'express';
import { LeadService } from '../services/lead.service';

// Create a new lead
export const createLead = async (req: Request, res: Response) => {
    try {
        const leadData = req.body;
        const newLead = await LeadService.createLead(leadData);
        res.status(201).json(newLead);
    } catch (error) {
        res.status(500).json({ message: 'Error creating lead', error });
    }
};

// Get all leads
export const getAllLeads = async (req: Request, res: Response) => {
    try {
        const leads = await LeadService.getAllLeads();
        res.status(200).json(leads);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leads', error });
    }
};

// Get a lead by ID
export const getLeadById = async (req: Request, res: Response) => {
    try {
        const leadId = req.params.id;
        const lead = await LeadService.getLeadById(leadId);
        if (lead) {
            res.status(200).json(lead);
        } else {
            res.status(404).json({ message: 'Lead not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching lead', error });
    }
};

// Update a lead
export const updateLead = async (req: Request, res: Response) => {
    try {
        const leadId = req.params.id;
        const leadData = req.body;
        const updatedLead = await LeadService.updateLead(leadId, leadData);
        if (updatedLead) {
            res.status(200).json(updatedLead);
        } else {
            res.status(404).json({ message: 'Lead not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating lead', error });
    }
};

// Delete a lead
export const deleteLead = async (req: Request, res: Response) => {
    try {
        const leadId = req.params.id;
        const deleted = await LeadService.deleteLead(leadId);
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Lead not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting lead', error });
    }
};