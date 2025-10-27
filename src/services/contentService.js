// Content Service for managing home page content
import matter from 'gray-matter';
import OFSDataService from './ofsDataService.js';

// Default content structure
const defaultContent = {
  hero: {
    title: "Welcome to Order of the Fallen Star",
    subtitle: "Elite Star Citizen Organization - Forging Legends Among the Stars",
    description: "Join our ranks as we explore the vast universe, engage in epic battles, and build a legacy that will echo through the cosmos.",
    stats: {
      members: "150+",
      ships: "50+", 
      systems: "5+"
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
}

export const contentService = new ContentService();
export default contentService;
