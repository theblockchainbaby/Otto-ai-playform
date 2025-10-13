import { Request, Response } from 'express';
import { AppointmentService } from '../services/appointment.service';

// Create a new appointment
export const createAppointment = async (req: Request, res: Response) => {
    try {
        const appointmentData = req.body;
        const newAppointment = await AppointmentService.createAppointment(appointmentData);
        res.status(201).json(newAppointment);
    } catch (error) {
        res.status(500).json({ message: 'Error creating appointment', error });
    }
};

// Get all appointments
export const getAppointments = async (req: Request, res: Response) => {
    try {
        const appointments = await AppointmentService.getAllAppointments();
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching appointments', error });
    }
};

// Get appointment by ID
export const getAppointmentById = async (req: Request, res: Response) => {
    try {
        const appointmentId = req.params.id;
        const appointment = await AppointmentService.getAppointmentById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.status(200).json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching appointment', error });
    }
};

// Update an appointment
export const updateAppointment = async (req: Request, res: Response) => {
    try {
        const appointmentId = req.params.id;
        const appointmentData = req.body;
        const updatedAppointment = await AppointmentService.updateAppointment(appointmentId, appointmentData);
        if (!updatedAppointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.status(200).json(updatedAppointment);
    } catch (error) {
        res.status(500).json({ message: 'Error updating appointment', error });
    }
};

// Delete an appointment
export const deleteAppointment = async (req: Request, res: Response) => {
    try {
        const appointmentId = req.params.id;
        const deleted = await AppointmentService.deleteAppointment(appointmentId);
        if (!deleted) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting appointment', error });
    }
};