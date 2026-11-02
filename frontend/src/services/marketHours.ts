import { MarketStatus, MarketPhase, MarketTimelineEvent } from '../types/trading';

/**
 * Calculates high-precision real-time National Stock Exchange (NSE / BSE) market open/closed status.
 * 
 * Official Indian Equities Trading Hours (Monday to Friday, IST - UTC+5:30):
 * - 09:00 to 09:08: Pre-open order entry & modification
 * - 09:08 to 09:12: Order matching & opening price discovery
 * - 09:12 to 09:15: Buffer period (transition to regular trading)
 * - 09:15 to 15:30: Regular continuous trading market session (375 minutes)
 * - 15:30 to 15:40: Closing price determination
 * - 15:40 to 16:00: Post-market closing session
 * - 16:00 to 09:00 Next Trading Day: Market Closed (After Market Orders / AMO accepted)
 * - Saturday & Sunday: Market Closed (Weekend)
 */
export function getNSEMarketStatus(): MarketStatus {
  try {
    const now = new Date();

    // Get current components in IST (Asia/Kolkata, UTC+5:30)
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    });

    const parts = formatter.formatToParts(now);
    const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';

    const weekday = getPart('weekday'); // 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
    const day = parseInt(getPart('day'), 10) || 1;
    const month = getPart('month');
    const year = parseInt(getPart('year'), 10) || 2026;
    const hour = parseInt(getPart('hour'), 10) || 0;
    const minute = parseInt(getPart('minute'), 10) || 0;
    const second = parseInt(getPart('second'), 10) || 0;

    const totalMinutes = hour * 60 + minute;
    const totalSeconds = totalMinutes * 60 + second;

    const isWeekend = ['Sat', 'Sun'].includes(weekday);

    // Timeline Boundaries in minutes from midnight IST
    const PRE_OPEN_START = 9 * 60;        // 09:00 = 540 min
    const REGULAR_OPEN = 9 * 60 + 15;     // 09:15 = 555 min
    const REGULAR_CLOSE = 15 * 60 + 30;   // 15:30 = 930 min
    const POST_CLOSE_END = 16 * 60;       // 16:00 = 960 min

    let phase: MarketPhase = 'CLOSED';
    let isOpen = false;
    let statusText = 'Market Closed';
    let phaseLabel = 'Market Closed';
    let nextSessionText = '';
    let timeRemainingText = '';
    let secondsRemaining = 0;
    let sessionProgressPercent = 0;

    if (isWeekend) {
      phase = 'CLOSED';
      isOpen = false;
      statusText = 'Market Closed (Weekend)';
      phaseLabel = 'Weekend Break';
      
      // Calculate seconds to Monday 09:15 AM IST
      // Days until Monday:
      const daysUntilMon = weekday === 'Sat' ? 2 : 1;
      const secondsLeftToday = (24 * 60 * 60) - totalSeconds;
      const secondsInFullDays = (daysUntilMon - 1) * 24 * 60 * 60;
      const mondayMorningSeconds = REGULAR_OPEN * 60;
      secondsRemaining = secondsLeftToday + secondsInFullDays + mondayMorningSeconds;
      
      const hours = Math.floor(secondsRemaining / 3600);
      const mins = Math.floor((secondsRemaining % 3600) / 60);
      const secs = secondsRemaining % 60;
      nextSessionText = 'Opens Monday 09:15 AM IST';
      timeRemainingText = `Opens in ${hours}h ${mins}m ${secs}s`;
      sessionProgressPercent = 0;
    } else {
      // Weekday
      if (totalMinutes < PRE_OPEN_START) {
        // Morning before 09:00 IST
        phase = 'CLOSED';
        isOpen = false;
        statusText = 'Market Closed';
        phaseLabel = 'Pre-Market starts at 09:00';
        secondsRemaining = (REGULAR_OPEN * 60) - totalSeconds;
        const hours = Math.floor(secondsRemaining / 3600);
        const mins = Math.floor((secondsRemaining % 3600) / 60);
        const secs = secondsRemaining % 60;
        nextSessionText = 'Opens Today 09:15 AM IST';
        timeRemainingText = `Opens in ${hours > 0 ? `${hours}h ` : ''}${mins}m ${secs}s`;
        sessionProgressPercent = 0;
      } else if (totalMinutes >= PRE_OPEN_START && totalMinutes < REGULAR_OPEN) {
        // Pre-Open 09:00 to 09:15 IST
        phase = 'PRE_OPEN';
        isOpen = false;
        statusText = 'Pre-Market Session';
        phaseLabel = 'Order Entry & Discovery';
        secondsRemaining = (REGULAR_OPEN * 60) - totalSeconds;
        const mins = Math.floor(secondsRemaining / 60);
        const secs = secondsRemaining % 60;
        nextSessionText = 'Regular Trading at 09:15 AM IST';
        timeRemainingText = `Regular trading in ${mins}m ${secs}s`;
        sessionProgressPercent = Math.round(((totalSeconds - PRE_OPEN_START * 60) / (15 * 60)) * 100);
      } else if (totalMinutes >= REGULAR_OPEN && totalMinutes < REGULAR_CLOSE) {
        // Regular Trading 09:15 to 15:30 IST
        phase = 'REGULAR_OPEN';
        isOpen = true;
        statusText = 'Market Open';
        phaseLabel = 'Regular Continuous Trading';
        secondsRemaining = (REGULAR_CLOSE * 60) - totalSeconds;
        const hours = Math.floor(secondsRemaining / 3600);
        const mins = Math.floor((secondsRemaining % 3600) / 60);
        const secs = secondsRemaining % 60;
        nextSessionText = 'Closes at 15:30 IST';
        timeRemainingText = `Closes in ${hours}h ${mins}m ${secs}s`;
        
        // Progress of regular 375-min session
        const sessionElapsedSeconds = totalSeconds - (REGULAR_OPEN * 60);
        const totalSessionSeconds = (REGULAR_CLOSE - REGULAR_OPEN) * 60;
        sessionProgressPercent = Math.min(100, Math.max(0, Math.round((sessionElapsedSeconds / totalSessionSeconds) * 100)));
      } else if (totalMinutes >= REGULAR_CLOSE && totalMinutes < POST_CLOSE_END) {
        // Post-market 15:30 to 16:00 IST
        phase = 'POST_CLOSE';
        isOpen = false;
        statusText = 'Post-Market Session';
        phaseLabel = 'Closing Price Determination';
        secondsRemaining = (POST_CLOSE_END * 60) - totalSeconds;
        const mins = Math.floor(secondsRemaining / 60);
        const secs = secondsRemaining % 60;
        nextSessionText = 'Session Ends at 16:00 IST';
        timeRemainingText = `Post-market ends in ${mins}m ${secs}s`;
        sessionProgressPercent = 100;
      } else {
        // Evening after 16:00 IST
        phase = 'CLOSED';
        isOpen = false;
        statusText = 'Market Closed';
        phaseLabel = 'After Market (AMO Accepted)';
        
        if (weekday === 'Fri') {
          // Friday evening -> Next is Monday 09:15
          const secondsLeftToday = (24 * 60 * 60) - totalSeconds;
          const weekendSeconds = 2 * 24 * 60 * 60;
          const mondayMorningSeconds = REGULAR_OPEN * 60;
          secondsRemaining = secondsLeftToday + weekendSeconds + mondayMorningSeconds;
          const hours = Math.floor(secondsRemaining / 3600);
          const mins = Math.floor((secondsRemaining % 3600) / 60);
          const secs = secondsRemaining % 60;
          nextSessionText = 'Opens Monday 09:15 AM IST';
          timeRemainingText = `Opens in ${hours}h ${mins}m ${secs}s`;
        } else {
          // Mon-Thu evening -> Tomorrow 09:15
          const secondsLeftToday = (24 * 60 * 60) - totalSeconds;
          const tomorrowMorningSeconds = REGULAR_OPEN * 60;
          secondsRemaining = secondsLeftToday + tomorrowMorningSeconds;
          const hours = Math.floor(secondsRemaining / 3600);
          const mins = Math.floor((secondsRemaining % 3600) / 60);
          const secs = secondsRemaining % 60;
          nextSessionText = 'Opens Tomorrow 09:15 AM IST';
          timeRemainingText = `Opens in ${hours}h ${mins}m ${secs}s`;
        }
        sessionProgressPercent = 0;
      }
    }

    // Exact timeline progress across official Indian trading hours (09:00 to 16:00 IST = 420 mins / 25,200s)
    const TIMELINE_START_SEC = PRE_OPEN_START * 60; // 09:00 = 32,400s
    const TIMELINE_END_SEC = POST_CLOSE_END * 60;   // 16:00 = 57,600s
    const TOTAL_TIMELINE_SEC = TIMELINE_END_SEC - TIMELINE_START_SEC; // 25,200s

    let timelineProgressPercent = 0;
    if (!isWeekend) {
      if (totalSeconds >= TIMELINE_START_SEC && totalSeconds <= TIMELINE_END_SEC) {
        timelineProgressPercent = Number((((totalSeconds - TIMELINE_START_SEC) / TOTAL_TIMELINE_SEC) * 100).toFixed(2));
      } else if (totalSeconds > TIMELINE_END_SEC) {
        timelineProgressPercent = 100;
      }
    }

    // Milestones calibrated proportionally along the 09:00 - 16:00 timeline track
    const timelineEvents: MarketTimelineEvent[] = [
      {
        time: '09:00',
        label: 'Pre-Open',
        passed: !isWeekend && totalMinutes >= PRE_OPEN_START,
        active: !isWeekend && totalMinutes >= PRE_OPEN_START && totalMinutes < REGULAR_OPEN,
        percentage: 0.0
      },
      {
        time: '09:15',
        label: 'Market Open',
        passed: !isWeekend && totalMinutes >= REGULAR_OPEN,
        active: !isWeekend && totalMinutes >= REGULAR_OPEN && totalMinutes < 11 * 60 + 30,
        percentage: 3.57
      },
      {
        time: '11:30',
        label: 'Europe Open',
        passed: !isWeekend && totalMinutes >= 11 * 60 + 30,
        active: !isWeekend && totalMinutes >= 11 * 60 + 30 && totalMinutes < 13 * 60 + 30,
        percentage: 35.71
      },
      {
        time: '13:30',
        label: 'Afternoon',
        passed: !isWeekend && totalMinutes >= 13 * 60 + 30,
        active: !isWeekend && totalMinutes >= 13 * 60 + 30 && totalMinutes < REGULAR_CLOSE,
        percentage: 64.29
      },
      {
        time: '15:30',
        label: 'Market Close',
        passed: !isWeekend && totalMinutes >= REGULAR_CLOSE,
        active: !isWeekend && totalMinutes >= REGULAR_CLOSE && totalMinutes < POST_CLOSE_END,
        percentage: 92.86
      },
      {
        time: '16:00',
        label: 'Post-Market',
        passed: !isWeekend && totalMinutes >= POST_CLOSE_END,
        active: false,
        percentage: 100.0
      }
    ];

    const hour12 = hour % 12 || 12;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const timeFormatted = `${hour12.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')} ${ampm} IST`;
    const dateFormatted = `${weekday}, ${day} ${month} ${year}`;

    return {
      isOpen,
      phase,
      phaseLabel,
      istTime: timeFormatted,
      istDate: dateFormatted,
      weekday,
      statusText,
      nextSessionText,
      timeRemainingText,
      secondsRemaining,
      sessionProgressPercent,
      timelineProgressPercent,
      isWeekend,
      isHoliday: false,
      timelineEvents
    };
  } catch (err) {
    return {
      isOpen: false,
      phase: 'CLOSED',
      phaseLabel: 'Market Closed',
      istTime: '12:00:00 PM IST',
      istDate: 'Saturday, 31 Oct 2026',
      weekday: 'Sat',
      statusText: 'Market Closed (Weekend)',
      nextSessionText: 'Opens Monday 09:15 AM IST',
      timeRemainingText: 'Opens in 45h 15m',
      secondsRemaining: 162900,
      sessionProgressPercent: 0,
      isWeekend: true,
      isHoliday: false,
      timelineEvents: []
    };
  }
}

/**
 * Returns clean formatted next market opening date, time, and current IST time
 */
export function getNextMarketOpenSchedule(): {
  nextOpenDateText: string;
  nextOpenTimeText: string;
  currentIstTime: string;
  currentIstDate: string;
  isWeekend: boolean;
  statusText: string;
} {
  const status = getNSEMarketStatus();
  const now = new Date();
  
  // Calculate exact target Date object in IST
  const targetDate = new Date(now.getTime() + (status.secondsRemaining > 0 ? status.secondsRemaining * 1000 : 86400000));
  const dateOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  };
  const nextOpenDateText = targetDate.toLocaleDateString('en-IN', dateOptions);
  const nextOpenTimeText = '09:15 AM IST';

  return {
    nextOpenDateText,
    nextOpenTimeText,
    currentIstTime: status.istTime,
    currentIstDate: status.istDate,
    isWeekend: status.isWeekend,
    statusText: status.statusText
  };
}

