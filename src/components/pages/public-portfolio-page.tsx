import { useState } from "react";
import { 
  Mail, 
  Phone, 
  MapPin,
  ExternalLink,
  Edit,
  Share2,
  Eye,
  Award,
  Copy
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { toast } from "sonner@2.0.3";
import logoImage from "figma:asset/9c281fd7f40d9fc8c08d2f76f2006a1e31355018.png";

interface Reference {
  id: string;
  title: string;
  description: string;
  linkUrl: string;
  imageUrl?: string;
}

interface PublicPortfolioPageProps {
  isOwner?: boolean;
  onEdit?: () => void;
}

export function PublicPortfolioPage({ isOwner = false, onEdit }: PublicPortfolioPageProps) {
  const [portfolioData] = useState({
    name: "John Doe",
    email: "john.doe@geobilling.com",
    phone: "+1 (555) 123-4567",
    department: "Engineering",
    title: "Senior Software Engineer",
    location: "San Francisco, CA",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    bio: "Passionate software engineer with 8+ years of experience building scalable web applications. Specialized in React, TypeScript, and cloud infrastructure. Led multiple successful projects that improved customer satisfaction by 40%.",
    contactVisibility: "org-only", // public, org-only, owner-only
    slug: "john-doe",
    referralCode: "JD8X4K2M",
    showReferralCode: true // Whether to display referral code publicly
  });

  const [references] = useState<Reference[]>([
    {
      id: "1",
      title: "Customer Portal Redesign",
      description: "Led the complete redesign of the customer-facing portal, improving user engagement by 45% and reducing support tickets by 30%.",
      linkUrl: "https://example.com/project1",
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop"
    },
    {
      id: "2",
      title: "Real-time Analytics Dashboard",
      description: "Built a real-time analytics dashboard processing 1M+ events per day, providing actionable insights to executive team.",
      linkUrl: "https://example.com/project2",
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop"
    },
    {
      id: "3",
      title: "Mobile App Architecture",
      description: "Designed and implemented the mobile app architecture serving 50K+ active users with 99.9% uptime.",
      linkUrl: "https://example.com/project3",
      imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop"
    },
    {
      id: "4",
      title: "Cloud Infrastructure Migration",
      description: "Orchestrated migration of legacy systems to AWS, reducing infrastructure costs by 35% while improving performance.",
      linkUrl: "https://example.com/project4",
      imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop"
    },
    {
      id: "5",
      title: "API Gateway Development",
      description: "Designed and built a secure API gateway handling 10M+ requests daily with sub-100ms response times.",
      linkUrl: "https://example.com/project5",
      imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop"
    },
    {
      id: "6",
      title: "Team Leadership & Mentoring",
      description: "Mentored 5 junior developers, established code review standards, and improved team velocity by 50%.",
      linkUrl: "https://example.com/project6",
      imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop"
    }
  ]);

  // Simulate checking if user is logged in and from same org
  const [isOrgMember] = useState(true);

  const shouldShowContact = () => {
    if (portfolioData.contactVisibility === "public") return true;
    if (portfolioData.contactVisibility === "org-only" && isOrgMember) return true;
    if (portfolioData.contactVisibility === "owner-only" && isOwner) return true;
    return false;
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/p/${portfolioData.slug}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Portfolio link copied to clipboard!");
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(portfolioData.referralCode);
    toast.success("Referral code copied!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Top Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={logoImage} alt="Geo Billing" className="w-8 h-8 object-contain" />
              <span className="text-gray-900">Geo Billing Portfolio</span>
            </div>
            {isOwner && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Eye className="h-3 w-3" />
                  Viewing as Owner
                </Badge>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Floating Toolbar for Owner */}
      {isOwner && (
        <div className="fixed bottom-8 right-8 z-50">
          <Card className="shadow-xl border-blue-200">
            <CardContent className="p-3 flex gap-2">
              <Button 
                size="sm" 
                className="gap-2 bg-green-600 hover:bg-green-700"
                onClick={onEdit}
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="gap-2"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <Card className="shadow-xl mb-8 overflow-hidden border-0">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage src={portfolioData.avatarUrl} />
                <AvatarFallback className="bg-blue-800 text-white text-3xl">
                  {portfolioData.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-white mb-2">{portfolioData.name}</h1>
                <p className="text-xl text-blue-100 mb-3">{portfolioData.title}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <Badge className="bg-blue-500 text-white hover:bg-blue-400">
                    {portfolioData.department}
                  </Badge>
                  <span className="flex items-center gap-1 text-blue-100">
                    <MapPin className="h-4 w-4" />
                    {portfolioData.location}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bio Section */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-gray-900">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {portfolioData.bio}
                </p>
              </CardContent>
            </Card>

            {/* Portfolio References */}
            <div>
              <h2 className="text-gray-900 mb-6">Portfolio & Achievements</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {references.map((reference) => (
                  <Card 
                    key={reference.id} 
                    className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden group"
                  >
                    {reference.imageUrl && (
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={reference.imageUrl} 
                          alt={reference.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-gray-900">{reference.title}</CardTitle>
                      <CardDescription className="text-gray-600">
                        {reference.description}
                      </CardDescription>
                    </CardHeader>
                    {reference.linkUrl && (
                      <CardContent>
                        <a 
                          href={reference.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 flex items-center gap-2 group/link"
                        >
                          <span>View Project</span>
                          <ExternalLink className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                        </a>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Referral Code - Show if enabled */}
            {portfolioData.showReferralCode && (
              <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Award className="h-5 w-5 text-blue-600" />
                    Referral Code
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-white border-2 border-blue-300 rounded-lg p-3 text-center">
                    <code className="text-xl font-mono text-blue-600 tracking-wider">
                      {portfolioData.referralCode}
                    </code>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyReferralCode}
                    className="w-full gap-2 border-blue-300 hover:bg-blue-50"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Code
                  </Button>
                  <p className="text-xs text-blue-800 text-center">
                    Use this code when connecting with {portfolioData.name.split(' ')[0]}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            {shouldShowContact() && (
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center justify-between">
                    Contact
                    {portfolioData.contactVisibility === "org-only" && (
                      <Badge variant="outline" className="text-xs">Org Only</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <a 
                    href={`mailto:${portfolioData.email}`}
                    className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors group"
                  >
                    <div className="bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 transition-colors">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-sm">{portfolioData.email}</span>
                  </a>
                  <a 
                    href={`tel:${portfolioData.phone}`}
                    className="flex items-center gap-3 text-gray-700 hover:text-green-600 transition-colors group"
                  >
                    <div className="bg-green-50 p-2 rounded-lg group-hover:bg-green-100 transition-colors">
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-sm">{portfolioData.phone}</span>
                  </a>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="bg-red-50 p-2 rounded-lg">
                      <MapPin className="h-5 w-5 text-red-600" />
                    </div>
                    <span className="text-sm">{portfolioData.location}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {!shouldShowContact() && (
              <Card className="shadow-lg border-0 bg-gray-50">
                <CardContent className="p-6 text-center">
                  <Eye className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Contact information is private
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Additional Info */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-green-50">
              <CardContent className="p-6">
                <h3 className="text-gray-900 mb-3">Portfolio Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Projects</span>
                    <Badge className="bg-green-600">{references.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Department</span>
                    <Badge variant="outline">{portfolioData.department}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {!isOwner && isOrgMember && (
              <Card className="shadow-lg border-0 border-blue-200 bg-blue-50">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-blue-800 mb-3">
                    Want to create your own portfolio?
                  </p>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}