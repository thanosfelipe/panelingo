import { supabase } from './supabase';

/**
 * Update a user's XP points
 */
export const updateUserXP = async (userId: string, xpToAdd: number): Promise<void> => {
  try {
    // Get current XP
    const { data: userData, error: fetchError } = await supabase
      .from('profiles')
      .select('xp_points')
      .eq('id', userId)
      .single();
    
    if (fetchError) throw fetchError;
    
    const currentXP = userData?.xp_points || 0;
    const newXP = currentXP + xpToAdd;
    
    // Update XP in database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ xp_points: newXP })
      .eq('id', userId);
    
    if (updateError) throw updateError;
    
    // Check for level-up achievements or other milestones
    // This could be expanded in the future
    if (Math.floor(currentXP / 1000) < Math.floor(newXP / 1000)) {
      console.log('User leveled up!');
      // Future: trigger level-up notification or reward
    }
  } catch (error) {
    console.error('Error updating XP:', error);
    throw error;
  }
};

/**
 * Update a user's daily streak
 */
export const updateDailyStreak = async (userId: string): Promise<void> => {
  try {
    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('daily_streak, last_streak_update')
      .eq('id', userId)
      .single();
    
    if (profileError) throw profileError;
    
    // Determine if streak should be incremented, maintained, or reset
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastUpdate = profile.last_streak_update 
      ? new Date(profile.last_streak_update) 
      : null;
      
    // Initialize variables
    let newStreak = profile.daily_streak || 0;
    let shouldUpdate = false;
    
    if (!lastUpdate) {
      // First activity - start streak
      newStreak = 1;
      shouldUpdate = true;
    } else {
      lastUpdate.setHours(0, 0, 0, 0);
      const timeDiff = today.getTime() - lastUpdate.getTime();
      const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
      
      if (dayDiff === 0) {
        // Already updated today, do nothing
        return;
      } else if (dayDiff === 1) {
        // Consecutive day, increment streak
        newStreak += 1;
        shouldUpdate = true;
      } else {
        // Streak broken
        newStreak = 1;
        shouldUpdate = true;
      }
    }
    
    if (shouldUpdate) {
      // Update the streak and last update date
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          daily_streak: newStreak,
          last_streak_update: today.toISOString()
        })
        .eq('id', userId);
      
      if (updateError) throw updateError;
      
      // Check for streak achievements
      if (newStreak === 7 || newStreak === 30 || newStreak === 100) {
        // Future: award streak badges
        console.log(`Streak milestone reached: ${newStreak} days`);
      }
    }
  } catch (error) {
    console.error('Error updating daily streak:', error);
    throw error;
  }
};

/**
 * Calculate user's learning stats
 */
export const getUserLearningStats = async (userId: string) => {
  try {
    // Get total learning time (from user_progress)
    const { data: timeData, error: timeError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);
    
    if (timeError) throw timeError;
    
    // Get completed lessons count
    const { count: completedLessons, error: lessonError } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (lessonError) throw lessonError;
    
    // Get total lessons count
    const { count: totalLessons, error: totalError } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true });
    
    if (totalError) throw totalError;
    
    // Calculate total time spent (estimated based on exercise attempts)
    // This is a rough estimate - could be refined with actual tracking
    const totalMinutes = timeData.reduce((total, progress) => {
      // Assume each attempt takes ~2 minutes
      return total + (progress.attempts * 2);
    }, 0);
    
    return {
      lessonsCompleted: completedLessons || 0,
      totalLessons: totalLessons || 0,
      totalMinutes: totalMinutes || 0
    };
  } catch (error) {
    console.error('Error getting learning stats:', error);
    // Return default values on error
    return {
      lessonsCompleted: 0,
      totalLessons: 0,
      totalMinutes: 0
    };
  }
};

/**
 * Calculate user level based on XP points
 * @param xp - The total XP points
 * @returns Object containing level, next level threshold, and progress to next level
 */
export const calculateUserLevel = (xp: number) => {
  // Base XP needed for level 1
  const baseXP = 20;
  // XP growth multiplier per level
  const growthFactor = 1.5;
  
  // If user has less than baseXP, they're level 1 with progress toward level 2
  if (xp < baseXP) {
    return {
      level: 1,
      currentXp: xp,
      requiredXp: baseXP,
      progressPercent: Math.floor((xp / baseXP) * 100),
      totalXp: xp
    };
  }
  
  let level = 1; // Start at level 1
  let xpThreshold = baseXP; // XP needed for level 2
  let totalXpSpent = 0; // XP spent on completed levels
  
  // Continue calculating levels until we can't reach the next one
  while (xp >= totalXpSpent + xpThreshold) {
    totalXpSpent += xpThreshold;
    level++;
    xpThreshold = Math.floor(baseXP * Math.pow(growthFactor, level - 1));
  }
  
  // Calculate progress to next level
  const currentLevelXp = xp - totalXpSpent;
  const progressPercent = Math.floor((currentLevelXp / xpThreshold) * 100);
  
  return {
    level,
    currentXp: currentLevelXp,
    requiredXp: xpThreshold,
    progressPercent,
    totalXp: xp
  };
}; 