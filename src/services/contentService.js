// Content Service for managing home page content
import matter from 'gray-matter';
import OFSDataService from './ofsDataService.js';

// Default content structure
const defaultContent = {
  hero: {
    title: "Welcome to Order of the Fallen Star",
    subtitle: "Elite Star Citizen Organization - Forging Legends Among the Stars",
    description: "Under the light of the Fallen Star, we bind our blades, our names, and our futures. This Codex governs all from Serf to Primarch.",
    stats: {
      members: "150+",
      quests: "50+", 
      systems: "2"
    },
    buttons: {
      primary: "Join Our Ranks",
      secondary: "Explore Our Fleet"
    }
  },
  features: {
    title: "What We Offer",
    cards: [
      {
        icon: "🚀",
        title: "Exploration",
        description: "Venture into uncharted territories and discover new worlds"
      },
      {
        icon: "⚔️",
        title: "Combat Operations", 
        description: "Engage in strategic battles and protect our interests"
      },
      {
        icon: "🏭",
        title: "Trade & Industry",
        description: "Build economic prosperity through commerce and manufacturing"
      },
      {
        icon: "🤝",
        title: "Community",
        description: "Join a brotherhood of elite pilots and lifelong friends"
      }
    ]
  },
  destiny: {
    title: "Choose Your Path",
    subtitle: "Select your role and define your legacy among the stars",
    paths: [
      // This will be populated dynamically from the spreadsheet
      {
        title: "Loading...",
        subtitle: "Loading path information...",
        description: "Please wait while we load the path information from our database.",
        image: "/Role Path/The Explorer.jpg",
        heroImage: "/Role Path/The Explorer - Hero.png"
      }
    ]
  },
  join: {
    title: "Ready to Join the Elite?",
    description: "Take your place among the stars with Order of the Fallen Star. Experience epic adventures, forge unbreakable bonds, and become part of a legendary organization that shapes the galaxy's future.",
    benefits: [
      { icon: "🌟", text: "Exclusive missions and events" },
      { icon: "🚀", text: "Access to organization fleet" },
      { icon: "🤝", text: "Active community support" }
    ],
    buttons: {
      primary: "Join Now",
      secondary: "Join Discord"
    }
  },
  socialLinks: {
    discord: {
      url: "https://discord.gg/your-server-code",
      enabled: true
    },
    spectrum: {
      url: "https://robertsspaceindustries.com/orgs/OOFS",
      enabled: true
    },
    website: {
      url: "https://your-org-website.com",
      enabled: false
    },
    youtube: {
      url: "https://youtube.com/your-channel",
      enabled: false
    }
  }
};

// Content service class
class ContentService {
  constructor() {
    this.content = { ...defaultContent };
    this.loadContent();
    this.loadPaths(); // Load dynamic paths from spreadsheet
    this.loadDynamicStats(); // Load dynamic member count
  }

  loadContent() {
    try {
      const stored = localStorage.getItem('homePageContent');
      if (stored) {
        this.content = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading content:', error);
      this.content = { ...defaultContent };
    }
  }

  async loadPaths() {
    try {
      console.log('Loading paths from spreadsheet...');
      const paths = await OFSDataService.getAllPaths();
      console.log('Paths loaded:', paths);
      if (paths && paths.length > 0) {
        this.content.destiny.paths = paths;
        // Trigger content update event
        window.dispatchEvent(new CustomEvent('contentUpdated'));
        console.log('Paths updated successfully');
      } else {
        console.log('No paths found in spreadsheet');
      }
    } catch (error) {
      console.error('Error loading paths from spreadsheet:', error);
      // Keep default paths if spreadsheet fails
    }
  }

  async loadDynamicStats() {
    try {
      console.log('Loading dynamic stats from spreadsheet...');
      
      // Load active member count from Member Log
      const activeMemberCount = await OFSDataService.getActiveMemberCount();
      console.log('Active member count:', activeMemberCount);
      
      // Load total patrol count for quests completed
      const totalPatrols = await OFSDataService.getTotalPatrolCount();
      console.log('Total patrol count:', totalPatrols);
      
      // Update stats if data is available
      if (activeMemberCount > 0) {
        this.content.hero.stats.members = `${activeMemberCount}`;
      }
      
      if (totalPatrols > 0) {
        this.content.hero.stats.quests = `${totalPatrols}+`;
      }
      
      // Trigger content update event
      window.dispatchEvent(new CustomEvent('contentUpdated'));
      console.log('Dynamic stats updated successfully');
    } catch (error) {
      console.error('Error loading dynamic stats from spreadsheet:', error);
      // Keep default stats if spreadsheet fails
    }
  }

  saveContent(newContent) {
    try {
      this.content = { ...newContent };
      localStorage.setItem('homePageContent', JSON.stringify(this.content));
      return true;
    } catch (error) {
      console.error('Error saving content:', error);
      return false;
    }
  }

  getContent() {
    return this.content;
  }

  resetToDefault() {
    this.content = { ...defaultContent };
    localStorage.removeItem('homePageContent');
    this.loadPaths(); // Reload paths from spreadsheet
    return this.content;
  }

  async refreshPaths() {
    await this.loadPaths();
    return this.content;
  }

  async refreshStats() {
    await this.loadDynamicStats();
    return this.content;
  }

  async refreshAll() {
    await Promise.all([
      this.loadPaths(),
      this.loadDynamicStats()
    ]);
    return this.content;
  }
}

export const contentService = new ContentService();
export default contentService;
