import { useState, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { block } from 'million/react';
import '../css/examples/create-event-calender.css';

const EventCalender = block(() => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const inputRef = useRef(null);

  const Date_Click_Fun = (date) => {
    setSelectedDate(date);
  };

  const Create_Event_Fun = () => {
    if (selectedDate && inputRef) {
      const newEvent = {
        id: new Date().getTime(),
        date: selectedDate,
        title: inputRef.current.value,
      };
      setEvents([...events, newEvent]);
      setSelectedDate(null);
      inputRef.current.value = '';
      setSelectedDate(newEvent.date);
    }
  };

  const Update_Event_Fun = (eventId, newName) => {
    const updated_Events = events.map((event) => {
      if (event.id === eventId) {
        return {
          ...event,
          title: newName,
        };
      }
      return event;
    });
    setEvents(updated_Events);
  };

  const Delete_Event_Fun = (eventId) => {
    const updated_Events = events.filter((event) => event.id !== eventId);
    setEvents(updated_Events);
  };

  return (
    <div className="create-event-calender">
      <h1>Create an Event Calendar Application</h1>
      <div className="create-event-calender_wrapper">
        <div className="calendar-container">
          <Calendar
            value={selectedDate}
            onClickDay={Date_Click_Fun}
            tileClassName={({ date }) =>
              selectedDate &&
              date.toDateString() === selectedDate.toDateString()
                ? 'selected'
                : events.some(
                    (event) =>
                      event.date.toDateString() === date.toDateString(),
                  )
                ? 'event-marked'
                : ''
            }
          />{' '}
        </div>
        <div className="event-container">
          {' '}
          {selectedDate && (
            <div className="event-form">
              <h2> Create Event </h2>{' '}
              <p> Selected Date: {selectedDate.toDateString()} </p>{' '}
              <input type="textarea" placeholder="Event Name" ref={inputRef} />
              <button className="create-btn" onClick={Create_Event_Fun}>
                Click Here to Add Event{' '}
              </button>{' '}
            </div>
          )}
          {events.length > 0 && selectedDate && (
            <div className="event-list">
              <h2> My Created Event List </h2>{' '}
              <div className="event-cards">
                {' '}
                {events.map((event) =>
                  event.date.toDateString() === selectedDate.toDateString() ? (
                    <div key={event.id} className="event-card">
                      <div className="event-card-header">
                        <span className="event-date">
                          {' '}
                          {event.date.toDateString()}{' '}
                        </span>{' '}
                        <div className="event-actions">
                          <button
                            className="update-btn"
                            onClick={() =>
                              Update_Event_Fun(
                                event.id,
                                prompt('ENTER NEW TITLE'),
                              )
                            }
                          >
                            Update Event{' '}
                          </button>{' '}
                          <button
                            className="delete-btn"
                            onClick={() => Delete_Event_Fun(event.id)}
                          >
                            Delete Event{' '}
                          </button>{' '}
                        </div>{' '}
                      </div>{' '}
                      <div className="event-card-body">
                        <p className="event-title"> {event.title} </p>{' '}
                      </div>{' '}
                    </div>
                  ) : null,
                )}{' '}
              </div>{' '}
            </div>
          )}{' '}
        </div>
      </div>
    </div>
  );
});

export default EventCalender;
