// Content Service for managing home page content
import matter from 'gray-matter';

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
    title: "Pick Your Destiny",
    subtitle: "Progress through our ranks and forge your legend among the stars",
    ranks: [
      {
        title: "Recruit",
        subtitle: "Begin your journey among the stars",
        description: "Welcome to Order of the Fallen Star! As a Recruit, you'll undergo comprehensive training in starship operations, combat protocols, and organizational values. Learn the fundamentals of space exploration, participate in training missions, and begin forging bonds with your fellow pilots. This is where legends are born and futures are shaped among the infinite cosmos.",
        responsibilities: [
          "Complete basic flight training certification",
          "Participate in simulated combat exercises", 
          "Learn organizational protocols and chain of command",
          "Assist experienced pilots on routine missions"
        ]
      },
      {
        title: "Pilot",
        subtitle: "Master the art of stellar navigation",
        description: "Having proven yourself as a capable Recruit, you now hold the rank of Pilot. Navigate through dangerous asteroid fields, escort valuable cargo shipments, and participate in reconnaissance missions across uncharted systems. Your skills in combat and exploration are developing, making you a valuable asset to our operations.",
        responsibilities: [
          "Lead small squadron formations",
          "Execute independent patrol missions",
          "Mentor new Recruits in basic operations",
          "Participate in medium-risk combat operations"
        ]
      },
      {
        title: "Commander", 
        subtitle: "Lead missions across the galaxy",
        description: "As a Commander, you've demonstrated exceptional leadership and tactical prowess. Coordinate multi-ship operations, plan strategic missions, and oversee critical organizational objectives. Your decisions impact the success of entire campaigns and the safety of your subordinates. The galaxy looks to you for guidance and protection.",
        responsibilities: [
          "Plan and execute large-scale operations",
          "Coordinate with other organizational divisions",
          "Oversee training programs for junior members",
          "Lead high-risk strategic missions"
        ]
      },
      {
        title: "Admiral",
        subtitle: "Command fleets and shape the future", 
        description: "The pinnacle of achievement within Order of the Fallen Star. As an Admiral, you shape the destiny of our organization and influence the balance of power across the galaxy. Command massive fleets, negotiate with other factions, and make decisions that echo through the stars for generations to come.",
        responsibilities: [
          "Command entire battle fleets",
          "Establish strategic partnerships and alliances",
          "Shape organizational policy and direction",
          "Represent the Order in galactic politics"
        ]
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
    return this.content;
  }
}

export const contentService = new ContentService();
export default contentService;
