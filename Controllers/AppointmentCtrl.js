const AppointmentModel = require('../Models/AppointmentModel');
const UserModel = require('../Models/UserModel');

// Book an appointment
const bookAppointment = async (req, res) => {
    try {
        const { patientId, doctorId, dateTime, symptoms, notes } = req.body;

        // Check if patient exists
        const patient = await UserModel.findById(patientId);
        if (!patient) return res.status(404).json({ message: 'Patient not found' });

        // Check if doctor exists
        const doctor = await UserModel.findById(doctorId);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

        // Check if doctor is available at this time
        const existingAppointment = await AppointmentModel.findOne({ doctorId, dateTime });
        if (existingAppointment) {
            return res.status(400).json({ message: 'Doctor is not available at this time' });
        }

        // Create new appointment
        const appointment = new AppointmentModel({ patientId, doctorId, dateTime, symptoms, notes });
        await appointment.save();

        res.status(201).json({ message: 'Appointment booked successfully', appointment });
    } catch (error) {
        res.status(500).json({ message: 'Error booking appointment', error });
    }
};

// Update appointment (status or notes)
const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const appointment = await AppointmentModel.findById(id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        // if cancelled 
        if(appointment.status === "cancelled") return res.json({ message: 'Appointment cancelled!'});

        // Update status or notes
        if (status) appointment.status = status;
        if (status === "cancelled" ) appointment.timeCancelled = new Date.now();
        if (notes) appointment.notes = notes;

        await appointment.save();
        res.json({ message: 'Appointment updated successfully', appointment });
    } catch (error) {
        res.status(500).json({ message: 'Error updating appointment', error });
    }
};


// Get appointments (all, or filtered by doctor/patient)
const getAppointments = async (req, res) => {
    try {
        const { doctorId, patientId } = req.query;
        let filter = {};
        
        if (doctorId) filter.doctorId = doctorId;
        if (patientId) filter.patientId = patientId;
        
        console.log(doctorId);
        console.log(patientId);
        console.log(filter);
        
        const appointments = await AppointmentModel.find(!filter === "undefined"? filter : {})
        .populate('patientId', 'name email phone')
        .populate('doctorId', 'name specialization');
        
        res.json(appointments);
        
    } catch (error) {
        res.status(500).json({ message: 'Error fetching appointments', error });
    }
};

// Cancel appointment
// const cancelAppointment = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const appointment = await AppointmentModel.findById(id);
//         if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

//         await appointment.deleteOne();
//         res.json({ message: 'Appointment canceled successfully' });
//     } catch (error) {
//         res.status(500).json({ message: 'Error canceling appointment', error });
//     }
// };

module.exports = {
    bookAppointment,
    updateAppointment,
    getAppointments,
    // cancelAppointment
};