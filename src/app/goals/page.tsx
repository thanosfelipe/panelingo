'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { X, Quote, CheckCircle, Timer, Brain, BookOpen, Plus, Book, Pencil, Zap, Calculator, Globe, Coffee, Music, Dumbbell, Bookmark } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const motivationalQuotes = [
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain"
  },
  {
    text: "It always seems impossible until it's done.",
    author: "Nelson Mandela"
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson"
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  },
  {
    text: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt"
  },
  {
    text: "Education is the most powerful weapon which you can use to change the world.",
    author: "Nelson Mandela"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    text: "Your time is limited, don't waste it living someone else's life.",
    author: "Steve Jobs"
  },
  {
    text: "The beautiful thing about learning is that nobody can take it away from you.",
    author: "B.B. King"
  }
];

// Activity options with custom settings
const activityOptions = [
  { 
    value: 'read', 
    label: 'Read', 
    icon: '📚',
    inputLabel: 'Read for',
    timeUnit: 'minutes'
  },
  { 
    value: 'write', 
    label: 'Write', 
    icon: '✏️',
    inputLabel: 'Write for',
    timeUnit: 'minutes'
  },
  { 
    value: 'code', 
    label: 'Code', 
    icon: '💻',
    inputLabel: 'Code for',
    timeUnit: 'minutes'
  },
  { 
    value: 'learn_language', 
    label: 'Learn a Language', 
    icon: '🗣️',
    inputLabel: 'Practice for',
    timeUnit: 'minutes'
  },
  { 
    value: 'walk', 
    label: 'Walk', 
    icon: '🚶',
    inputLabel: 'Walk for',
    timeUnit: 'minutes'
  },
  { 
    value: 'drink_water', 
    label: 'Drink Water', 
    icon: '💧',
    inputLabel: 'Drink water every',
    timeUnit: 'minutes'
  },
  { 
    value: 'learn_instrument', 
    label: 'Learn Instrument', 
    icon: '🎸',
    inputLabel: 'Practice for',
    timeUnit: 'minutes'
  },
  { 
    value: 'meditate', 
    label: 'Meditate', 
    icon: '🧘',
    inputLabel: 'Meditate for',
    timeUnit: 'minutes'
  },
  { 
    value: 'breathing', 
    label: 'Breathing Exercises', 
    icon: '🫁',
    inputLabel: 'Do breathing exercises for',
    timeUnit: 'minutes'
  },
  { 
    value: 'side_hustle', 
    label: 'Side Projects', 
    icon: '💼',
    inputLabel: 'Work on projects for',
    timeUnit: 'minutes'
  },
  { 
    value: 'sleep_well', 
    label: 'Sleep Well', 
    icon: '😴',
    inputLabel: 'Sleep for',
    timeUnit: 'hours',
    hasUnitToggle: true
  },
  { 
    value: 'cold_shower', 
    label: 'Cold Shower', 
    icon: '🚿',
    inputLabel: 'Take cold showers for',
    timeUnit: 'minutes'
  },
  { 
    value: 'reduce_coffee', 
    label: 'Reduce Coffee', 
    icon: '☕',
    inputLabel: 'Replace coffee for',
    timeUnit: 'minutes'
  },
  { 
    value: 'no_phone', 
    label: 'Break Phone Addiction', 
    icon: '📵',
    inputLabel: 'Stay off phone for',
    timeUnit: 'hours',
    hasUnitToggle: true
  },
  { 
    value: 'no_junk_food', 
    label: 'No Junk Food', 
    icon: '🥗',
    inputLabel: 'Prepare healthy meals for',
    timeUnit: 'minutes'
  },
  { 
    value: 'flashcards', 
    label: 'Use Flashcards', 
    icon: '🃏',
    inputLabel: 'Study flashcards for',
    timeUnit: 'minutes'
  },
  { 
    value: 'group_study', 
    label: 'Group Study', 
    icon: '👥',
    inputLabel: 'Study with others for',
    timeUnit: 'minutes'
  },
  { 
    value: 'practice_tests', 
    label: 'Practice Tests', 
    icon: '📝',
    inputLabel: 'Take practice tests for',
    timeUnit: 'minutes'
  }
];

const timeOptions = [
  { value: "5", label: "5 minutes" },
  { value: "10", label: "10 minutes" },
  { value: "15", label: "15 minutes" },
  { value: "20", label: "20 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
];

const frequencyOptions = [
  { value: "weekly", label: "Every week" },
  { value: "weekday", label: "On weekdays" },
  { value: "weekend", label: "On weekends" },
  { value: "2x_week", label: "2x per week" },
  { value: "3x_week", label: "3x per week" },
  { value: "daily", label: "Every day ⭐️" }
];

// Card colors
const cardColors = [
  "bg-gradient-to-r from-blue-500 to-cyan-500",
  "bg-gradient-to-r from-purple-500 to-indigo-500",
  "bg-gradient-to-r from-green-500 to-emerald-500",
  "bg-gradient-to-r from-orange-500 to-amber-500",
  "bg-gradient-to-r from-pink-500 to-rose-500"
];

// Goal interface
interface Goal {
  id: string;
  activity: string;
  activityLabel: string;
  activityIcon: string;
  time: string;
  frequency: string;
  fact: string;
  createdAt: Date;
  color: string;
  accepted?: boolean; // Whether the goal has been accepted or is pending
  timeUnit?: 'minutes' | 'hours'; // Optional time unit for habits like sleep
}

// Time period options for goal projections
const timePeriodOptions = [
  { value: 'week', label: '1 week' },
  { value: 'month', label: '1 month' },
  { value: 'year', label: '1 year' },
  { value: '2years', label: '2 years' },
  { value: '3years', label: '3 years' },
  { value: '5years', label: '5 years' },
];

// Helper function to get formatted frequency text
const getFormattedFrequency = (frequency: string, forFact: boolean = false) => {
  const frequencyOption = frequencyOptions.find(f => f.value === frequency);
  
  if (frequencyOption) {
    // For fun facts, remove the star emoji from "Every day"
    if (forFact && frequency === 'daily') {
      return "every day";
    }
    return frequencyOption.label;
  }
  
  // Fallback formatting for specific frequencies if not found in options
  switch (frequency) {
    case '3x_week':
      return '3x per week';
    case '2x_week':
      return '2x per week';
    default:
      return frequency.replace('_', ' ');
  }
};

// Helper function to get distance-based place analogies
const getDistanceAnalogy = (miles: number) => {
  if (miles < 1) return "around your neighborhood";
  if (miles < 3) return "to your local coffee shop and back";
  if (miles < 7) return "across Central Park";
  if (miles < 15) return "to the nearest subway station and back 5 times";
  if (miles < 30) return "across Manhattan";
  if (miles < 50) return "to the next town over";
  if (miles < 100) return "between neighboring cities";
  if (miles < 200) return "across the state border";
  if (miles < 500) return "between major cities";
  if (miles < 1000) return "across your entire state";
  if (miles < 2000) return "halfway across the country";
  return "across the entire country";
};

// Helper function to get reading volume analogies
const getReadingAnalogy = (pages: number) => {
  if (pages < 50) return "a detailed research paper";
  if (pages < 100) return "an in-depth article collection";
  if (pages < 300) return "Harry Potter and the Sorcerer's Stone";
  if (pages < 500) return "a full textbook chapter";
  if (pages < 1000) return "an entire textbook";
  if (pages < 2000) return "the Lord of the Rings";
  if (pages < 5000) return "the entire Harry Potter series";
  return "an entire library shelf";
};

// Helper function to get code volume analogies
const getCodeAnalogy = (lines: number) => {
  if (lines < 100) return "a useful utility function";
  if (lines < 500) return "a small web component";
  if (lines < 1000) return "a functioning mobile app screen";
  if (lines < 3000) return "a complete small app";
  if (lines < 10000) return "a professional software module";
  if (lines < 50000) return "an entire app ecosystem";
  return "an operating system component";
};

// Calculate motivational facts based on user selections
const calculateImpactFacts = (activity: string, minutes: number, frequency: string, period: string = 'year') => {
  // Convert time to period-based totals
  let sessionsInPeriod = 0;
  
  // Sessions per week based on frequency
  let sessionsPerWeek = 0;
  switch (frequency) {
    case 'daily':
      sessionsPerWeek = 7;
      break;
    case 'weekday':
      sessionsPerWeek = 5;
      break;
    case 'weekend':
      sessionsPerWeek = 2;
      break;
    case '3x_week':
      sessionsPerWeek = 3;
      break;
    case '2x_week':
      sessionsPerWeek = 2;
      break;
    case 'weekly':
      sessionsPerWeek = 1;
      break;
    default:
      sessionsPerWeek = 7;
  }
  
  // Calculate for the selected period
  switch (period) {
    case 'week':
      sessionsInPeriod = sessionsPerWeek;
      break;
    case 'month':
      sessionsInPeriod = sessionsPerWeek * 4.33; // Average weeks in a month
      break;
    case 'year':
      sessionsInPeriod = sessionsPerWeek * 52;
      break;
    case '2years':
      sessionsInPeriod = sessionsPerWeek * 52 * 2;
      break;
    case '3years':
      sessionsInPeriod = sessionsPerWeek * 52 * 3;
      break;
    case '5years':
      sessionsInPeriod = sessionsPerWeek * 52 * 5;
      break;
    default:
      sessionsInPeriod = sessionsPerWeek * 4.33;
  }
  
  // Calculate total minutes and hours for the period
  const totalMinutes = minutes * sessionsInPeriod;
  const hoursInPeriod = totalMinutes / 60;
  
  // Get formatted frequency text for facts
  const formattedFrequency = getFormattedFrequency(frequency, true);
  const periodText = period === 'week' ? 'a week' : 
                    period === 'month' ? 'a month' : 
                    period === '2years' ? '2 years' : 
                    period === '3years' ? '3 years' : 
                    period === '5years' ? '5 years' : 'a year';
  
  // Calculate walking distance (average pace of 3 miles per hour)
  const walkingMiles = Math.round(hoursInPeriod * 3);
  const walkingPlaceAnalogy = getDistanceAnalogy(walkingMiles);
  
  // Calculate reading pages (average 2 pages per minute)
  const readingPages = Math.round(totalMinutes * 2);
  const readingAnalogy = getReadingAnalogy(readingPages);
  
  // Calculate code lines (average 10 lines per minute for active coding)
  const codeLines = Math.round(totalMinutes * 10);
  const codeAnalogy = getCodeAnalogy(codeLines);
  
  // Base exam preparation facts with analogies that adjust based on time period
  const examFacts = {
    "read": [
      `That's enough reading to consume ${Math.max(1, Math.round(totalMinutes/300))} ${totalMinutes < 300 ? 'book chapter' : 'encyclopedias'} - like downloading knowledge directly to your brain!`,
      `You'll process ${Math.max(5, Math.round(readingPages))} pages - ${readingPages < 20 ? 'jumpstarting your memory' : `equivalent to ${readingPages < 200 ? 'a textbook chapter' : 'the entire Harry Potter series'} in one sitting`}!`
    ],
    "write": [
      `That's enough writing to stack ${Math.max(1, Math.round((totalMinutes / 5) / 200))} ${totalMinutes < 500 ? 'inch' : 'coffee cups'} of paper - ${totalMinutes < 500 ? 'creating a solid foundation' : 'building a manuscript taller than you'}!`,
      `You'll create ${Math.max(1, Math.round(totalMinutes / 5))} pages - forming neural connections equivalent to ${Math.max(1, Math.round(totalMinutes / 30))} mile${Math.round(totalMinutes / 30) !== 1 ? 's' : ''} of brain superhighways!`
    ],
    "code": [
      `You'll write ${Math.max(10, codeLines)} lines of code - enough to build ${codeLines < 50 ? 'a useful function' : codeLines < 500 ? 'a component' : 'an app'} worth $${Math.max(5, Math.round(codeLines * 5))}!`,
      `That's enough code to create ${Math.max(1, Math.round(codeLines/2000))} ${codeLines < 2000 ? 'feature' : 'complete app'} - installing a problem-solving processor in your brain!`
    ],
    "learn_language": [
      `You'll master ${Math.max(1, Math.round(totalMinutes/80))} dictionary page${Math.round(totalMinutes/80) !== 1 ? 's' : ''} - like having a ${totalMinutes < 300 ? 'phrasebook' : 'universal translator'} in your memory!`,
      `That's enough practice to understand ${Math.max(1, Math.round(totalMinutes/120))} ${totalMinutes < 120 ? 'conversation' : 'episode'} ${totalMinutes < 120 ? '' : 'of a foreign show'} without subtitles!`
    ],
    "walk": [
      `You'll walk ${Math.max(0.1, Number(walkingMiles.toFixed(1)))} miles - enough to ${walkingMiles < 0.5 ? 'clear your mind' : `travel ${walkingPlaceAnalogy}`} while boosting brain function by ${Math.max(5, Math.round(walkingMiles/3) + 10)}%!`,
      `That's enough walking to burn ${Math.max(10, Math.round(walkingMiles * 100))} calories - giving your brain ${Math.max(1, Math.round(sessionsInPeriod/2))} natural performance boost${Math.round(sessionsInPeriod/2) !== 1 ? 's' : ''}!`
    ],
    "drink_water": [
      `You'll consume ${Math.max(0.1, Number((sessionsInPeriod * 0.5).toFixed(1)))} liters of brain-enhancing fluid - like installing a ${sessionsInPeriod < 7 ? 'mini' : 'full'} cooling system for your mind!`,
      `That's enough hydration to flush ${Math.max(0.1, Number((sessionsInPeriod*0.3).toFixed(1)))} gallons of mental fog from your neural circuitry!`
    ],
    "learn_instrument": [
      `You'll practice for ${Math.max(0.5, Math.round(hoursInPeriod))} hours - creating neural pathways with ${Math.max(1, Math.round(hoursInPeriod/20))} extra processing power for your brain!`,
      `That's enough practice to develop brain activity that outshines non-musicians by ${Math.max(1.1, Number((hoursInPeriod/20).toFixed(1)))}x!`
    ],
    "meditate": [
      `You'll clear mental space equivalent to adding ${Math.max(1, Math.round(totalMinutes/60))}GB of RAM to your brain's operating system!`,
      `That's enough meditation to install ${Math.max(1, Math.round(sessionsInPeriod/20))} mental noise-canceling system${Math.round(sessionsInPeriod/20) !== 1 ? 's' : ''} in your mind!`
    ],
    "breathing": [
      `You'll deliver oxygen equivalent to having ${Math.max(1, Math.round(hoursInPeriod * 2))} air-purifying plant${Math.round(hoursInPeriod * 2) !== 1 ? 's' : ''} in your mental workspace!`,
      `That's enough breathing to lower your heart rate by ${Math.max(2, Math.round(minutes/10) + 2)} BPM during exams - instant calm when you need it!`
    ],
    "side_hustle": [
      `You'll create ${Math.max(1, Math.round(hoursInPeriod/30))} portfolio piece${Math.round(hoursInPeriod/30) !== 1 ? 's' : ''} - building a showcase that would take ${Math.max(0.5, Math.round(hoursInPeriod/4))} hours to explore!`,
      `That's enough project work to collect ${Math.max(1, Math.round(totalMinutes/60))} key skill${Math.round(totalMinutes/60) !== 1 ? 's' : ''} for real-world applications!`
    ],
    "sleep_well": [
      `You'll gain ${Math.max(1, Math.round(hoursInPeriod))} hours of quality sleep - allowing your brain to complete ${Math.max(1, Math.round(hoursInPeriod * 0.2))} memory cycles!`,
      `That's enough sleep to give your brain ${Math.max(1, Math.round(hoursInPeriod/20))} maintenance session${Math.round(hoursInPeriod/20) !== 1 ? 's' : ''} - upgrading your neural pathways overnight!`
    ],
    "cold_shower": [
      `You'll trigger a natural energy boost equivalent to ${Math.max(1, Math.round(sessionsInPeriod/10))} energy shot${Math.round(sessionsInPeriod/10) !== 1 ? 's' : ''} - flipping on the switches in your mind!`,
      `That's enough cold exposure to boost circulation like upgrading from dial-up to ${sessionsInPeriod < 10 ? 'broadband' : 'fiber-optic'} internet in your brain!`
    ],
    "reduce_coffee": [
      `You'll give your adrenal glands ${Math.max(1, Math.round(sessionsInPeriod/10))} recovery cycle${Math.round(sessionsInPeriod/10) !== 1 ? 's' : ''} - letting your mental engine cool between tasks!`,
      `That's enough caffeine reduction to improve your sleep quality by ${Math.max(5, Math.round(sessionsInPeriod/4))}% - enhancing memory consolidation!`
    ],
    "no_phone": [
      `You'll protect yourself from ${Math.max(5, Math.round(totalMinutes/10))} attention-hijacking notifications - like having a bodyguard for your concentration!`,
      `That's enough focus to recover ${Math.max(0.5, Math.round(totalMinutes/120))} hours that would otherwise be lost to endless scrolling!`
    ],
    "no_junk_food": [
      `You'll avoid ${Math.max(1, Math.round(sessionsInPeriod))} servings of inflammatory foods - removing mental friction from your brain's gears!`,
      `That's enough healthy eating to apply ${Math.max(1, Math.round(sessionsInPeriod/20))} layer${Math.round(sessionsInPeriod/20) !== 1 ? 's' : ''} of neural insulation to your brain circuits!`
    ],
    "flashcards": [
      `You'll create ${Math.max(5, Math.round(totalMinutes/10))} memory reinforcements - installing support beams for facts under exam pressure!`,
      `That's enough practice to build ${Math.max(1, Math.round(sessionsInPeriod/10))} retrieval pathway${Math.round(sessionsInPeriod/10) !== 1 ? 's' : ''} like GPS systems for your brain!`
    ],
    "group_study": [
      `You'll gain exposure to ${Math.max(2, Math.round(totalMinutes/20))} unique insights - like having ${Math.max(1, Math.round(sessionsInPeriod/10))} tutor${Math.round(sessionsInPeriod/10) !== 1 ? 's' : ''} pointing out your blind spots!`,
      `That's enough explaining to build ${Math.max(1, Math.round(sessionsInPeriod/10))} memory pillar${Math.round(sessionsInPeriod/10) !== 1 ? 's' : ''} that make concepts impossible to forget!`
    ],
    "practice_tests": [
      `You'll simulate ${Math.max(1, Math.round(sessionsInPeriod/10))} exam environment${Math.round(sessionsInPeriod/10) !== 1 ? 's' : ''} - like a pilot logging ${sessionsInPeriod < 10 ? 'initial' : 'extensive'} simulator hours!`,
      `That's enough practice to create ${Math.max(1, Math.round(totalMinutes/100))} autopilot system${Math.round(totalMinutes/100) !== 1 ? 's' : ''} for answering questions effortlessly!`
    ]
  };
  
  // Default to reading if the activity isn't in our fact list
  const activityKey = examFacts[activity as keyof typeof examFacts] ? activity : "read";
  
  return examFacts[activityKey as keyof typeof examFacts];
};

// Fisher-Yates shuffle algorithm to randomize the card colors
const getRandomColor = () => {
  // Create a copy of the cardColors array
  const colors = [...cardColors];
  
  // Shuffle the array
  for (let i = colors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [colors[i], colors[j]] = [colors[j], colors[i]];
  }
  
  // Return a random color from the shuffled array
  return colors[Math.floor(Math.random() * colors.length)];
};

export default function GoalsPage() {
  const { user } = useAuth();
  const [quote, setQuote] = useState(motivationalQuotes[0]);
  const [quoteTimeRemaining, setQuoteTimeRemaining] = useState(30); // 30 seconds timer for quotes
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [selectedActivityLabel, setSelectedActivityLabel] = useState<string | null>(null);
  const [selectedActivityIcon, setSelectedActivityIcon] = useState<string | null>(null);
  const [selectedActivitySettings, setSelectedActivitySettings] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [time, setTime] = useState("");
  const [frequency, setFrequency] = useState("");
  const [timeUnit, setTimeUnit] = useState<'minutes' | 'hours'>('minutes');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [timePeriod, setTimePeriod] = useState<string>('month');
  const [cachedFacts, setCachedFacts] = useState<Record<string, string>>({});
  
  // Initialize goals from localStorage on component mount
  useEffect(() => {
    const savedGoalsFromStorage = localStorage.getItem('goals');
    if (savedGoalsFromStorage) {
      try {
        const parsedGoals = JSON.parse(savedGoalsFromStorage);
        // Convert string dates back to Date objects
        const goalsWithDates = parsedGoals.map((goal: any) => ({
          ...goal,
          createdAt: new Date(goal.createdAt),
          accepted: goal.accepted || true, // All stored goals are accepted
          timeUnit: goal.timeUnit || 'minutes' // Default to minutes if not provided
        }));
        setGoals(goalsWithDates);
      } catch (error) {
        console.error('Error parsing saved goals:', error);
      }
    }
  }, []);

  // Save goals to localStorage when they change
  useEffect(() => {
    // Only save accepted goals
    const acceptedGoals = goals.filter(goal => goal.accepted === true);
    if (acceptedGoals.length > 0) {
      localStorage.setItem('goals', JSON.stringify(acceptedGoals));
    }
  }, [goals]);
  
  // Quote timer and change
  useEffect(() => {
    // Set up the timer countdown
    const countdownInterval = setInterval(() => {
      setQuoteTimeRemaining(prev => {
        if (prev <= 1) {
          return 30; // Reset to 30 when it hits 0
        }
        return prev - 1;
      });
    }, 1000);

    // Change the quote every 30 seconds
    const quoteInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
      setQuote(prevQuote => {
        // Ensure we get a different quote
        if (prevQuote.text === motivationalQuotes[randomIndex].text) {
          const nextIndex = (randomIndex + 1) % motivationalQuotes.length;
          return motivationalQuotes[nextIndex];
        }
        return motivationalQuotes[randomIndex];
      });
      setQuoteTimeRemaining(30); // Reset timer when quote changes
    }, 30000);
    
    return () => {
      clearInterval(countdownInterval);
      clearInterval(quoteInterval);
    };
  }, []);
  
  // Handle activity selection
  const handleActivitySelect = (activity: string) => {
    const activityOption = activityOptions.find(option => option.value === activity);
    if (activityOption) {
      setSelectedActivity(activity);
      setSelectedActivityLabel(activityOption.label);
      setSelectedActivityIcon(activityOption.icon);
      setSelectedActivitySettings(activityOption);
      
      // Set default timeUnit based on activity
      setTimeUnit(activityOption.timeUnit === 'hours' ? 'hours' : 'minutes');
      
      setShowDialog(true);
    }
  };
  
  // Close dialog and reset values
  const handleCloseDialog = () => {
    setShowDialog(false);
    setTime("");
    setFrequency("");
    setTimeUnit('minutes');
  };
  
  // Add a new goal
  const handleAddGoal = () => {
    if (selectedActivity && time && frequency) {
      // Store the time value as provided (don't convert between units when storing)
      const timeValue = time;
      
      // For facts calculation, always convert to minutes if needed
      const minutesForFacts = timeUnit === 'hours' ? parseInt(time) * 60 : parseInt(time);
      
      const facts = calculateImpactFacts(selectedActivity, minutesForFacts, frequency, timePeriod);
      const randomFact = facts[Math.floor(Math.random() * facts.length)];
      
      // Get a truly random color using the shuffle algorithm
      const randomColor = getRandomColor();
      
      const newGoal: Goal = {
        id: Date.now().toString(),
        activity: selectedActivity,
        activityLabel: selectedActivityLabel || "",
        activityIcon: selectedActivityIcon || "",
        time: timeValue,
        frequency,
        fact: randomFact,
        createdAt: new Date(),
        color: randomColor,
        accepted: true,
        timeUnit: timeUnit // Always store the time unit with the goal
      };
      
      setGoals(prev => [newGoal, ...prev]);
      
      // Close dialog and reset
      handleCloseDialog();
    }
  };

  // Rename function to reflect its new purpose - just deleting goals
  const handleDeleteGoal = (id: string) => {
    setGoals(currentGoals => {
      const updatedGoals = currentGoals.filter(goal => goal.id !== id);
      
      // Immediately update localStorage with the filtered goals
      // This ensures the deletion persists across navigation
      if (updatedGoals.length > 0) {
        localStorage.setItem('goals', JSON.stringify(updatedGoals.filter(goal => goal.accepted === true)));
      } else {
        localStorage.removeItem('goals'); // Remove item if no goals left
      }
      
      return updatedGoals;
    });
  };

  // Get a new random quote
  const getNewQuote = () => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setQuote(prevQuote => {
      if (prevQuote.text === motivationalQuotes[randomIndex].text) {
        const nextIndex = (randomIndex + 1) % motivationalQuotes.length;
        return motivationalQuotes[nextIndex];
      }
      return motivationalQuotes[randomIndex];
    });
  };

  // Calculate projection hours based on time period
  const calculateProjectionHours = (goalTime: string, goalFrequency: string, period: string, timeUnit: 'minutes' | 'hours' = 'minutes') => {
    // Parse the input time value
    const timeValue = parseInt(goalTime);
    
    // Calculate sessions based on frequency
    let sessionsPerWeek = 0;
    switch (goalFrequency) {
      case 'daily':
        sessionsPerWeek = 7;
        break;
      case 'weekday':
        sessionsPerWeek = 5;
        break;
      case 'weekend':
        sessionsPerWeek = 2;
        break;
      case '3x_week':
        sessionsPerWeek = 3;
        break;
      case '2x_week':
        sessionsPerWeek = 2;
        break;
      case 'weekly':
        sessionsPerWeek = 1;
        break;
      default:
        sessionsPerWeek = 7;
    }
    
    // Calculate total sessions based on period
    let totalSessions = 0;
    switch (period) {
      case 'week':
        totalSessions = sessionsPerWeek;
        break;
      case 'month':
        totalSessions = sessionsPerWeek * 4.33; // Average weeks in a month
        break;
      case 'year':
        totalSessions = sessionsPerWeek * 52;
        break;
      case '2years':
        totalSessions = sessionsPerWeek * 52 * 2;
        break;
      case '3years':
        totalSessions = sessionsPerWeek * 52 * 3;
        break;
      case '5years':
        totalSessions = sessionsPerWeek * 52 * 5;
        break;
      default:
        totalSessions = sessionsPerWeek * 4.33;
    }
    
    // Calculate total time based on unit
    if (timeUnit === 'hours') {
      // If the input is already in hours, just multiply by sessions
      return Math.round(timeValue * totalSessions);
    } else {
      // If the input is in minutes, convert to hours
      return Math.round((timeValue * totalSessions) / 60);
    }
  };
  
  // Get projection label based on time period
  const getProjectionLabel = (period: string) => {
    switch (period) {
      case 'week':
        return 'this week';
      case 'month':
        return 'this month';
      case 'year':
        return 'this year';
      case '2years':
        return 'in 2 years';
      case '3years':
        return 'in 3 years';
      case '5years':
        return 'in 5 years';
      default:
        return 'this month';
    }
  };
  
  // Get cached fact or generate a new one for a goal and period
  const getGoalFact = (goal: Goal, period: string) => {
    // Create a unique key for this goal and period
    const factKey = `${goal.id}_${period}`;
    
    // Return cached fact if it exists
    if (cachedFacts[factKey]) {
      return cachedFacts[factKey];
    }
    
    // Calculate minutes or hours for facts based on the time unit
    let minutesForFacts = parseInt(goal.time);
    
    // If the goal is using hours, convert to minutes for the fact calculation
    if (goal.timeUnit === 'hours') {
      minutesForFacts = minutesForFacts * 60;
    }
    
    // Generate facts directly with the period parameter
    const facts = calculateImpactFacts(goal.activity, minutesForFacts, goal.frequency, period);
    const newFact = facts[Math.floor(Math.random() * facts.length)];
    
    // Cache this fact
    setCachedFacts(prev => ({
      ...prev,
      [factKey]: newFact
    }));
    
    return newFact;
  };

  // Reset cached facts when time period changes
  useEffect(() => {
    setCachedFacts({});
  }, [timePeriod]);

  // Helper function to get proper time display based on habit and unit
  const getTimeDisplay = (goal: Goal) => {
    const time = parseInt(goal.time);
    
    // If the time unit is explicitly set to hours, display as hours
    if (goal.timeUnit === 'hours') {
      return `${time} ${time === 1 ? 'hour' : 'hours'}`;
    }
    
    // For time values in minutes that are better displayed in hours format
    if (!goal.timeUnit || goal.timeUnit === 'minutes') {
      if (time >= 60) {
        const hours = Math.floor(time / 60);
        const remainingMinutes = time % 60;
        
        // If it's a clean hour with no remaining minutes
        if (remainingMinutes === 0) {
          return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
        }
        
        // Hours and minutes format
        return `${hours}h ${remainingMinutes}m`;
      }
      
      // Display time in minutes
      return `${time} ${time === 1 ? 'minute' : 'minutes'}`;
    }
    
    // Fallback
    return `${time} ${goal.timeUnit}`;
  };

  // Helper function to get the proper goal description
  const getGoalDescription = (goal: Goal) => {
    const activityOption = activityOptions.find(option => option.value === goal.activity);
    
    if (activityOption?.inputLabel) {
      const timeDisplay = getTimeDisplay(goal);
      const frequencyDisplay = getFormattedFrequency(goal.frequency);
      
      // Special case for activities with special phrasing
      if (goal.activity === 'drink_water') {
        return `I'll drink water every ${frequencyDisplay}`;
      }
      
      // General case
      return `I'll ${activityOption.label.toLowerCase()} for ${timeDisplay} ${frequencyDisplay}`;
    }
    
    // Fallback to original format
    return `I'll ${goal.activityLabel.toLowerCase()} for ${getTimeDisplay(goal)} ${getFormattedFrequency(goal.frequency)}`;
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center mb-10">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-4">
              Set Your Study Goals
            </h1>
            <p className="text-gray-400 text-center max-w-2xl">
              Choose an activity to create a study goal that will help you prepare for your exams.
            </p>
          </div>
          
          {/* Step Indicators */}
          <div className="flex items-center mb-8">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500 text-white font-bold">
              1
            </div>
            <div className="ml-3 text-gray-200 font-medium">Pick habits</div>
          </div>
          
          {/* Activity Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-10">
            {activityOptions.map((activity) => (
              <button
                key={activity.value}
                className="bg-gray-800/60 hover:bg-gray-700/60 backdrop-blur-sm border border-gray-700 rounded-lg p-4 text-left transition-all duration-200 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                onClick={() => handleActivitySelect(activity.value)}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3" role="img" aria-label={activity.label}>
                    {activity.icon}
                  </span>
                  <span className="text-gray-200 font-medium">{activity.label}</span>
                </div>
              </button>
            ))}
          </div>
          
          {/* Time Period Filter Dropdown - left aligned with cards */}
          {goals.filter(goal => goal.accepted === true).length > 0 && (
            <div className="mb-6 px-1">
              <div className="flex items-center">
                <span className="text-gray-300 mr-3 whitespace-nowrap">How much I will achieve in</span>
                <div className="bg-gray-800/80 border border-gray-700 rounded-lg px-2">
                  <Select value={timePeriod} onValueChange={setTimePeriod}>
                    <SelectTrigger className="bg-transparent border-none min-h-0 h-8 w-32 text-indigo-400 focus:ring-0 focus:ring-offset-0 shadow-none">
                      <SelectValue placeholder="Select time period" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {timePeriodOptions.map(option => (
                        <SelectItem key={option.value} value={option.value} className="text-gray-200 data-[highlighted]:bg-indigo-600 data-[highlighted]:text-white">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          
          {/* Goals List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
            {goals.map((goal) => (
              <Card 
                key={goal.id} 
                className={`${goal.color} overflow-hidden rounded-xl shadow-lg relative transition-all duration-300`}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2" role="img" aria-label={goal.activityLabel}>
                        {goal.activityIcon}
                      </span>
                      <span className="text-white font-bold uppercase tracking-wide text-sm">
                        {goal.activityLabel}
                      </span>
                    </div>
                    
                    {/* Delete button for all goals */}
                    <button 
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="bg-gray-800/40 hover:bg-gray-800/70 text-white rounded-full h-8 w-8 flex items-center justify-center transition-colors"
                      aria-label="Delete goal"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="mb-3">
                    <div className="text-white text-3xl font-bold">
                      {calculateProjectionHours(goal.time, goal.frequency, timePeriod, goal.timeUnit)}
                      <span className="text-lg ml-1 opacity-90">hours</span>
                    </div>
                    <div className="text-white text-sm opacity-90">
                      {getGoalDescription(goal)}
                    </div>
                  </div>
                  <p className="text-white text-base font-bold">
                    {getGoalFact(goal, timePeriod)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Quote Card */}
          <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border-gray-700 overflow-hidden">
            <div className="p-6 relative">
              <div className="absolute top-4 right-4 text-indigo-400/20">
                <Quote size={48} />
              </div>
              <blockquote className="text-xl text-gray-100 font-medium mb-4 relative z-10">
                &ldquo;{quote.text}&rdquo;
              </blockquote>
              <footer className="text-right text-gray-400 mb-6">
                — {quote.author}
              </footer>
              
              {/* Quote timer with gradient */}
              <div className="mt-4 w-full bg-gray-700/30 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${(quoteTimeRemaining / 30) * 100}%` }}
                ></div>
              </div>
              <div className="mt-2 text-xs text-gray-500 text-right">
                Next quote in {quoteTimeRemaining}s
              </div>
            </div>
          </Card>
          
          {/* Modal/Dialog for setting goal parameters */}
          {showDialog && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 relative">
                <button 
                  onClick={handleCloseDialog}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white"
                  aria-label="Close dialog"
                >
                  <X size={24} />
                </button>
                
                <div className="mb-5 flex items-center">
                  <span className="text-3xl mr-3" role="img" aria-label={selectedActivityLabel || ''}>
                    {selectedActivityIcon}
                  </span>
                  <h2 className="text-xl text-white font-semibold">{selectedActivityLabel}</h2>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      {selectedActivitySettings?.inputLabel || "How long?"}
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        min="1"
                        max={timeUnit === 'hours' ? 24 : 240}
                        placeholder={`Enter ${timeUnit}`}
                        className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-200 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      
                      {/* Time unit selector for applicable habits */}
                      {selectedActivitySettings?.hasUnitToggle ? (
                        <div className="ml-3">
                          <Select value={timeUnit} onValueChange={(value: 'minutes' | 'hours') => setTimeUnit(value)}>
                            <SelectTrigger className="bg-gray-700 border border-gray-600 min-h-0 h-9 w-24 text-gray-200 focus:ring-0 focus:ring-offset-0 shadow-none">
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="minutes" className="text-gray-200 data-[highlighted]:bg-indigo-600 data-[highlighted]:text-white">
                                minutes
                              </SelectItem>
                              <SelectItem value="hours" className="text-gray-200 data-[highlighted]:bg-indigo-600 data-[highlighted]:text-white">
                                hours
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <span className="ml-3 text-gray-400">{selectedActivitySettings?.timeUnit || 'minutes'}</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">How often?</label>
                    <Select value={frequency} onValueChange={setFrequency}>
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {frequencyOptions.map(option => (
                          <SelectItem key={option.value} value={option.value} className="text-gray-200">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    className="w-1/3 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    onClick={handleCloseDialog}
                  >
                    CANCEL
                  </Button>
                  <Button 
                    className="w-2/3 ml-3 bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={handleAddGoal}
                    disabled={!time || !frequency}
                  >
                    ADD HABIT
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
} 