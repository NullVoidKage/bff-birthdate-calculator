import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specific HTTP methods
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization'); // Allow specific headers
  res.setHeader('Access-Control-Allow-Credentials', 'true'); // Allow credentials like cookies to be sent
  next();
});

function getZodiacSign(month: number, day: number): string {
  const zodiacSigns = [
    'Capricorn',
    'Aquarius',
    'Pisces',
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn', // Capricorn repeats for the end of the year
  ];

  const zodiacDates = [
    [1, 20],
    [2, 19],
    [3, 21],
    [4, 20],
    [5, 21],
    [6, 21],
    [7, 23],
    [8, 23],
    [9, 23],
    [10, 23],
    [11, 22],
    [12, 22],
    [12, 31], // Add a date for the end of December
  ];

  for (let i = 0; i < zodiacDates.length; i++) {
    const [startMonth, startDay] = zodiacDates[i];
    const [endMonth, endDay] = zodiacDates[i + 1];

    if (
      (month === startMonth - 1 && day >= startDay) ||
      (month === endMonth - 1 && day <= endDay)
    ) {
      return zodiacSigns[i];
    }
  }

  return ''; // Return an empty string if no zodiac sign is found
}

// Calculate age endpoint
app.post('/calculate', (req: Request, res: Response) => {
  try {
    const { birthDate } = req.body;

    const birthTimestamp = new Date(birthDate).getTime();
    const currentTimestamp = new Date().getTime();
    const ageInSeconds = Math.floor((currentTimestamp - birthTimestamp) / 1000);

    const ageInMinutes = Math.floor(ageInSeconds / 60);
    const ageInHours = Math.floor(ageInSeconds / 3600);
    const ageInDays = Math.floor(ageInSeconds / 86400);
    const ageInWeeks = Math.floor(ageInDays / 7);
    const ageInMonths = Math.floor(ageInDays / 30);
    const ageInYears = Math.floor(ageInSeconds / 31536000);

    const centuries = Math.floor(ageInYears / 100);
    const decades = Math.floor(ageInYears / 10);

    const birthDateObj = new Date(birthDate);
    const dayOfWeek = birthDateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const month = birthDateObj.getMonth() + 1;
    const day = birthDateObj.getDate();
    
    const zodiacSign = getZodiacSign(month, day);

    // Determine generation based on birth year
    const birthYear = birthDateObj.getFullYear();
    let generation = '';
    if (birthYear >= 1997 && birthYear <= 2012) {
      generation = 'Gen Z (12 - 27)';
    } else if (birthYear >= 1981 && birthYear <= 1996) {
      generation = 'Millennials (28 - 43)';
    } else if (birthYear >= 1965 && birthYear <= 1980) {
      generation = 'Gen X (44 - 59)';
    } else if (birthYear >= 1955 && birthYear <= 1964) {
      generation = 'Boomers II (a/k/a Generation Jones) (60 - 69)';
    } else if (birthYear >= 1946 && birthYear <= 1954) {
      generation = 'Boomers I (70 - 78)';
    } else if (birthYear >= 1928 && birthYear <= 1945) {
      generation = 'Post War (79 - 96)';
    } else if (birthYear >= 1922 && birthYear <= 1927) {
      generation = 'WWII (97 - 102)';
    } else {
      generation = 'Other';
    }

    res.json({
      years: ageInYears,
      seconds: ageInSeconds,
      hours: ageInHours,
      minutes: ageInMinutes,
      days: ageInDays,
      weeks: ageInWeeks,
      months: ageInMonths,
      centuries,
      decades,
      dayOfWeek,
      zodiacSign,
      generation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/compatibility', (req: Request, res: Response) => {
  try {
    const { dateOne, dateTwo } = req.body;

    const timestamp1 = new Date(dateOne).getTime();
    const timestamp2 = new Date(dateTwo).getTime();

    // Calculate the difference in milliseconds between the two dates
    const diffMilliseconds = Math.abs(timestamp1 - timestamp2);

    // Calculate the maximum difference in milliseconds (e.g., 100 years)
    const maxDiffMilliseconds = 100 * 365.25 * 24 * 60 * 60 * 1000;

    // Calculate the compatibility as a percentage
    const compatibilityPercentage = (1 - diffMilliseconds / maxDiffMilliseconds) * 100;

    // Ensure compatibilityPercentage is within [0, 100] range
    const compatibility = Math.min(Math.max(compatibilityPercentage, 0), 100);

    // Get the zodiac signs for both dates
    const dateOneObj = new Date(dateOne);
    const dateTwoObj = new Date(dateTwo);
    const signOne = getZodiacSign(dateOneObj.getMonth() + 1, dateOneObj.getDate());
    const signTwo = getZodiacSign(dateTwoObj.getMonth() + 1, dateTwoObj.getDate());

    res.json({ compatibility, signOne, signTwo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
