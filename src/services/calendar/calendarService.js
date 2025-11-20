/**
 * Calendar export service for generating .ics files and exporting to Google Calendar
 */

/**
 * Generate an .ics file content from room data
 * @param {Object} room - The focus room object
 * @returns {string} - ICS file content
 */
export function generateICSContent(room) {
  if (!room || !room.scheduledFor) {
    console.error('Room export error:', { room, hasScheduledFor: room?.scheduledFor });
    throw new Error('Room must have a scheduledFor timestamp to export. Please ensure the room has a scheduled date/time.');
  }

  const roomId = room.id || 'room';
  const roomName = room.name || 'Focus Room';
  
  // Convert timestamps to ICS format (YYYYMMDDTHHMMSSZ)
  const startDate = new Date(room.scheduledFor);
  const durationSeconds = room.duration || 1500; // default 25 min
  const endDate = new Date(room.scheduledFor + durationSeconds * 1000);

  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startISO = formatDate(startDate);
  const endISO = formatDate(endDate);

  // Sanitize room name for ICS (remove special characters that might break ICS format)
  const sanitizedName = roomName.replace(/"/g, '\\"').replace(/[\r\n]/g, ' ');
  const sanitizedHost = (room.creatorName || 'Focus Room Host').replace(/"/g, '\\"').replace(/[\r\n]/g, ' ');

  // Build ICS content
  const uid = `${roomId}@timerapp.local`;
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Timer App//Focus Room Calendar Export//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Focus Room: ${sanitizedName}
X-WR-TIMEZONE:UTC
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatDate(new Date())}
DTSTART:${startISO}
DTEND:${endISO}
SUMMARY:${sanitizedName}
DESCRIPTION:Focus room hosted by ${sanitizedHost}. Maximum participants: ${room.maxParticipants || 10}.
LOCATION:Timer App Focus Room
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

  return icsContent;
}

/**
 * Download an .ics file for a room
 * @param {Object} room - The focus room object
 */
export function downloadICSFile(room) {
  try {
    const icsContent = generateICSContent(room);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${room.name.replace(/\s+/g, '_')}-${new Date(room.scheduledFor).toISOString().split('T')[0]}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading ICS file:', error);
    throw error;
  }
}

/**
 * Generate a Google Calendar URL to add an event
 * @param {Object} room - The focus room object
 * @returns {string} - Google Calendar URL
 */
export function generateGoogleCalendarURL(room) {
  if (!room || !room.scheduledFor) {
    console.error('Room export error:', { room, hasScheduledFor: room?.scheduledFor });
    throw new Error('Room must have a scheduledFor timestamp to export. Please ensure the room has a scheduled date/time.');
  }

  const startDate = new Date(room.scheduledFor);
  const durationSeconds = room.duration || 1500; // default 25 min
  const endDate = new Date(room.scheduledFor + durationSeconds * 1000);

  // Format dates for Google Calendar: YYYYMMDDTHHMMSSZ (UTC format)
  const formatGoogleDate = (date) => {
    // Convert to ISO string, remove dashes and colons, remove milliseconds, add Z
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startFormatted = formatGoogleDate(startDate);
  const endFormatted = formatGoogleDate(endDate);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: room.name,
    details: `Focus room hosted by ${room.creatorName || 'Focus Room Host'}. Maximum participants: ${room.maxParticipants || 10}.`,
    location: 'Timer App Focus Room',
    dates: `${startFormatted}/${endFormatted}`
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Batch export multiple scheduled rooms to .ics file
 * @param {Array} rooms - Array of focus room objects
 * @returns {void} Downloads combined .ics file
 */
export function downloadMultipleRoomsAsICS(rooms) {
  if (!rooms || rooms.length === 0) {
    throw new Error('No rooms to export');
  }

  // Filter rooms with scheduledFor timestamp
  const validRooms = rooms.filter(r => r && r.scheduledFor);
  if (validRooms.length === 0) {
    throw new Error('No scheduled rooms to export');
  }

  // Build VCALENDAR with multiple VEVENTs
  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  let vevents = '';
  validRooms.forEach(room => {
    const startDate = new Date(room.scheduledFor);
    const durationSeconds = room.duration || 1500;
    const endDate = new Date(room.scheduledFor + durationSeconds * 1000);

    const sanitizedName = room.name.replace(/"/g, '\\"').replace(/[\r\n]/g, ' ');
    const sanitizedHost = (room.creatorName || 'Focus Room Host').replace(/"/g, '\\"').replace(/[\r\n]/g, ' ');
    const uid = `${room.id}@timerapp.local`;

    vevents += `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${sanitizedName}
DESCRIPTION:Focus room hosted by ${sanitizedHost}. Maximum participants: ${room.maxParticipants || 10}.
LOCATION:Timer App Focus Room
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
`;
  });

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Timer App//Focus Room Calendar Export//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Focus Rooms - ${new Date().toLocaleDateString()}
X-WR-TIMEZONE:UTC
${vevents}END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `focus-rooms-${new Date().toISOString().split('T')[0]}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Generate an .ics file content from a timer with scheduled date/time
 * @param {Object} timer - Timer object with name, duration
 * @param {Date} scheduledDate - When to schedule this timer
 * @returns {string} - ICS file content
 */
export function generateTimerICSContent(timer, scheduledDate) {
  if (!timer || !scheduledDate) {
    throw new Error('Timer and scheduled date are required');
  }

  const timerId = `timer-${timer.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;
  const timerName = timer.name || 'Timer';
  
  // Convert timestamps to ICS format (YYYYMMDDTHHMMSSZ)
  const startDate = new Date(scheduledDate);
  const durationMinutes = timer.duration || 25; // default 25 min
  const durationMs = durationMinutes * 60 * 1000;
  const endDate = new Date(startDate.getTime() + durationMs);

  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startISO = formatDate(startDate);
  const endISO = formatDate(endDate);

  // Sanitize timer name for ICS
  const sanitizedName = timerName.replace(/"/g, '\\"').replace(/[\r\n]/g, ' ');
  const group = timer.group ? ` (${timer.group})` : '';

  // Build ICS content
  const uid = `${timerId}@timerapp.local`;
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Timer App//Timer Calendar Export//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Timer: ${sanitizedName}
X-WR-TIMEZONE:UTC
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatDate(new Date())}
DTSTART:${startISO}
DTEND:${endISO}
SUMMARY:${sanitizedName}${group}
DESCRIPTION:Timer duration: ${durationMinutes} minute(s). Scene: ${timer.scene || 'none'}.
LOCATION:Timer App
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

  return icsContent;
}

/**
 * Download an .ics file for a timer with scheduled date
 * @param {Object} timer - Timer object
 * @param {Date} scheduledDate - When to schedule this timer
 */
export function downloadTimerAsICS(timer, scheduledDate) {
  try {
    const icsContent = generateTimerICSContent(timer, scheduledDate);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${timer.name.replace(/\s+/g, '_')}-${new Date(scheduledDate).toISOString().split('T')[0]}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading timer ICS file:', error);
    throw error;
  }
}

/**
 * Generate a Google Calendar URL for a timer
 * @param {Object} timer - Timer object
 * @param {Date} scheduledDate - When to schedule this timer
 * @returns {string} - Google Calendar URL
 */
export function generateTimerGoogleCalendarURL(timer, scheduledDate) {
  if (!timer || !scheduledDate) {
    throw new Error('Timer and scheduled date are required');
  }

  const startDate = new Date(scheduledDate);
  const durationMinutes = timer.duration || 25;
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  // Format dates for Google Calendar: YYYYMMDDTHHMMSS
  const formatGoogleDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0];
  };

  const startFormatted = formatGoogleDate(startDate);
  const endFormatted = formatGoogleDate(endDate);
  const group = timer.group ? ` (${timer.group})` : '';

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${timer.name}${group}`,
    details: `Timer: ${timer.duration} minute(s). Scene: ${timer.scene || 'none'}.`,
    location: 'Timer App',
    dates: `${startFormatted}Z/${endFormatted}Z`
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Batch export multiple timers with scheduled dates to .ics file
 * @param {Array} timers - Array of timer objects with scheduledDate property
 * @returns {void} Downloads combined .ics file
 */
export function downloadMultipleTimersAsICS(timers) {
  if (!timers || timers.length === 0) {
    throw new Error('No timers to export');
  }

  // Filter timers with scheduledDate timestamp
  const validTimers = timers.filter(t => t && t.scheduledDate);
  if (validTimers.length === 0) {
    throw new Error('No scheduled timers to export');
  }

  // Build VCALENDAR with multiple VEVENTs
  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  let vevents = '';
  validTimers.forEach((timer, index) => {
    const startDate = new Date(timer.scheduledDate);
    const durationMinutes = timer.duration || 25;
    const durationMs = durationMinutes * 60 * 1000;
    const endDate = new Date(startDate.getTime() + durationMs);

    const sanitizedName = timer.name.replace(/"/g, '\\"').replace(/[\r\n]/g, ' ');
    const group = timer.group ? ` (${timer.group})` : '';
    const uid = `timer-${index}-${Date.now()}@timerapp.local`;

    vevents += `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${sanitizedName}${group}
DESCRIPTION:Timer duration: ${durationMinutes} minute(s). Scene: ${timer.scene || 'none'}.
LOCATION:Timer App
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
`;
  });

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Timer App//Timer Calendar Export//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Scheduled Timers - ${new Date().toLocaleDateString()}
X-WR-TIMEZONE:UTC
${vevents}END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `scheduled-timers-${new Date().toISOString().split('T')[0]}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}
