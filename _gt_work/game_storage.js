/**
 * Executive Game Theory - Central Zero-PII Client-Side Storage & Leaderboard Engine
 * Strictly enforces: Overall Score = sum(Video Games) + 2 * sum(Quiz Simulations)
 */
const GTStorage = (function() {
  const STORAGE_KEY_USER = 'gt_active_user';
  const STORAGE_KEY_STATE = 'gt_game_state';

  function init() {
    if (!localStorage.getItem(STORAGE_KEY_STATE)) {
      const defaultState = {
        leaderboard: [
          { user_id: 'usr_demo02', display_name: 'NashMaster', video_score: 1450, sim_score: 920, overall_score: 3290, last_active: new Date().toISOString() },
          { user_id: 'usr_demo01', display_name: 'SkyStrategist', video_score: 1820, sim_score: 680, overall_score: 3180, last_active: new Date().toISOString() },
          { user_id: 'usr_demo03', display_name: 'HorizonExec', video_score: 980, sim_score: 850, overall_score: 2680, last_active: new Date().toISOString() }
        ],
        modules: { lesson_01: { video_high: 0, sim_high: 0 } }
      };
      localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(defaultState));
    }
  }

  function getActiveUser() {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) {
      const defaultUser = { user_id: 'usr_' + Math.random().toString(36).substr(2, 8), display_name: 'ExecutiveLearner', avatar: '🎯' };
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(defaultUser));
      return defaultUser;
    }
    return JSON.parse(raw);
  }

  function setActiveUser(displayName, avatar) {
    const user = { user_id: 'usr_' + Math.random().toString(36).substr(2, 8), display_name: displayName || 'ExecutivePlayer', avatar: avatar || '💼' };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    return user;
  }

  function getState() {
    init();
    return JSON.parse(localStorage.getItem(STORAGE_KEY_STATE));
  }

  function recordScore(lessonId, type, score) {
    init();
    const user = getActiveUser();
    const state = getState();
    
    if (!state.modules[lessonId]) {
      state.modules[lessonId] = { video_high: 0, sim_high: 0 };
    }
    
    if (type === 'video') {
      state.modules[lessonId].video_high = Math.max(state.modules[lessonId].video_high || 0, score);
    } else if (type === 'sim') {
      state.modules[lessonId].sim_high = Math.max(state.modules[lessonId].sim_high || 0, score);
    }
    
    let entry = state.leaderboard.find(p => p.user_id === user.user_id || p.display_name === user.display_name);
    if (!entry) {
      entry = {
        user_id: user.user_id,
        display_name: user.display_name,
        video_score: type === 'video' ? score : 0,
        sim_score: type === 'sim' ? score : 0,
        overall_score: 0,
        last_active: new Date().toISOString()
      };
      state.leaderboard.push(entry);
    } else {
      if (type === 'video') entry.video_score = Math.max(entry.video_score || 0, score);
      if (type === 'sim') entry.sim_score = Math.max(entry.sim_score || 0, score);
      entry.last_active = new Date().toISOString();
    }
    
    entry.overall_score = (entry.video_score || 0) + (2 * (entry.sim_score || 0));
    state.leaderboard.sort((a, b) => b.overall_score - a.overall_score);
    localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(state));
    return entry;
  }

  return {
    init,
    getActiveUser,
    setActiveUser,
    getState,
    recordScore
  };
})();