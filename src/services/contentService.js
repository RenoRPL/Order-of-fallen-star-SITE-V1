// Content Service for managing home page content
import matter from 'gray-matter';
import OFSDataService from './ofsDataService.js';

// Default content structure
const defaultContent = {
  version: "1.3.2", // Updated version for Join Org button changes
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
      secondary: "RSI Page"
    }
  },
  features: {
    title: "What We Offer",
    cards: [
      {
        title: "Exploration",
        description: "Venture into uncharted territories and discover new worlds"
      },
      {
        title: "Combat Operations", 
        description: "Engage in strategic battles and protect our interests"
      },
      {
        title: "Trade & Industry",
        description: "Build economic prosperity through commerce and manufacturing"
      },
      {
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
      { text: "Exclusive missions and events" },
      { text: "Access to organization fleet" },
      { text: "Active community support" }
    ],
    buttons: {
      primary: "Join Org",
      secondary: "Join Discord"
    }
  },
  socialLinks: {
    discord: {
      url: "https://discord.gg/3dhZ38nbNZ",
      enabled: true
    },
    spectrum: {
      url: "https://robertsspaceindustries.com/en/orgs/FALLSTR",
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
    
    // Load dynamic data with error handling
    this.loadDynamicData();
  }

  async loadDynamicData() {
    try {
      // Load paths and stats in parallel with error handling
      await Promise.allSettled([
        this.loadPaths(),
        this.loadDynamicStats(),
        this.loadWhatWeOffer()
      ]);
    } catch (error) {
      console.error('Error loading dynamic data:', error);
      // Ensure the site still works with default content
    }
  }

  loadContent() {
    try {
      const stored = localStorage.getItem('homePageContent');
      if (stored) {
        const parsedContent = JSON.parse(stored);
        // Check version to force updates
        if (parsedContent.version !== defaultContent.version) {
          console.log('Content version mismatch, using new defaults');
          this.content = { ...defaultContent };
          localStorage.removeItem('homePageContent');
        } else {
          this.content = parsedContent;
        }
      } else {
        this.content = { ...defaultContent };
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
        console.log('No paths found in spreadsheet, keeping defaults');
      }
    } catch (error) {
      console.error('Error loading paths from spreadsheet:', error);
      // Keep default paths if spreadsheet fails
      console.log('Using default paths due to error');
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
      } else {
        console.log('No active member data, keeping default');
      }
      
      if (totalPatrols > 0) {
        this.content.hero.stats.quests = `${totalPatrols}+`;
      } else {
        console.log('No patrol data, keeping default');
      }
      
      // Trigger content update event
      window.dispatchEvent(new CustomEvent('contentUpdated'));
      console.log('Dynamic stats updated successfully');
    } catch (error) {
      console.error('Error loading dynamic stats from spreadsheet:', error);
      // Keep default stats if spreadsheet fails
      console.log('Using default stats due to error');
    }
  }

  async loadWhatWeOffer() {
    try {
      console.log('Loading What We Offer from spreadsheet...');
      const features = await OFSDataService.getWhatWeOffer();
      console.log('Features loaded:', features);
      
      if (features && features.length > 0) {
        this.content.features.cards = features;
        // Trigger content update event
        window.dispatchEvent(new CustomEvent('contentUpdated'));
        console.log('What We Offer updated successfully');
      } else {
        console.log('No features found in spreadsheet, keeping defaults');
      }
    } catch (error) {
      console.error('Error loading What We Offer from spreadsheet:', error);
      // Keep default features if spreadsheet fails
      console.log('Using default features due to error');
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
    this.loadDynamicData(); // Reload dynamic data
    // Force immediate update
    window.dispatchEvent(new CustomEvent('contentUpdated'));
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
      this.loadDynamicStats(),
      this.loadWhatWeOffer()
    ]);
    return this.content;
  }

  async refreshFeatures() {
    await this.loadWhatWeOffer();
    return this.content;
  }

  // Force clear cache and reload defaults
  forceClearCache() {
    localStorage.removeItem('homePageContent');
    this.content = { ...defaultContent };
    this.loadDynamicData();
    window.dispatchEvent(new CustomEvent('contentUpdated'));
    console.log('Cache cleared, content reset to defaults');
    return this.content;
  }
}

export const contentService = new ContentService();
export default contentService;
