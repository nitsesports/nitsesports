import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import {
  Trophy,
  Gamepad2,
  Zap,
  Gift,
  Calendar,
  Clock,
  Users,
  Edit2,
  Save,
  Award,
  TrendingUp,
  Mail,
  Phone,
  User,
  Eye,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  fetchUserStats,
  fetchUpcomingMatches,
  fetchUserTournaments,
  fetchUserRewards,
  fetchUserStatistics,
  claimReward,
  fetchUnregisteredGames,
} from "@/lib/dashboardService";
import RegisterTeamDialog from "@/components/RegisterTeamDialog";
import { events } from "@/data/events";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    inGameName: "",
    phone: "",
    bio: "",
  });

  // Dashboard data states
  const [stats, setStats] = useState({ tournaments: 0, matches: 0, rank: 0, rewards: 0 });
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [totalRewards, setTotalRewards] = useState(0);
  const [pendingRewards, setPendingRewards] = useState(0);
  const [userStats, setUserStats] = useState({ tournamentsJoined: 0, matchesPlayed: 0, winRate: 0 });
  const [unregisteredGames, setUnregisteredGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false);
  const [selectedGameForRegistration, setSelectedGameForRegistration] = useState(null);
  console.log(events);
  // Fetch user session and data
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setFormData({
          fullName: session.user.user_metadata?.full_name || "",
          email: session.user.email || "",
          inGameName: session.user.user_metadata?.in_game_name || "",
          phone: session.user.user_metadata?.phone || "",
          bio: session.user.user_metadata?.bio || "",
        });
      }
    };

    fetchUser();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      }
    });

    return () => subscription?.subscription.unsubscribe();
  }, []);

  // Fetch dashboard data from database
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.email) return;

      setLoading(true);
      try {
        // Fetch all data in parallel
        const [statsRes, matchesRes, tournamentsRes, rewardsRes, userStatsRes, unregisteredRes] = await Promise.all([
          fetchUserStats(user.email),
          fetchUpcomingMatches(user.email),
          fetchUserTournaments(user.email),
          fetchUserRewards(user.email),
          fetchUserStatistics(user.email),
          fetchUnregisteredGames(user.email),
        ]);

        // Update states with fetched data
        setStats(statsRes);
        setUpcomingMatches(matchesRes.matches || []);
        setTournaments(tournamentsRes.tournaments || []);
        setRewards(rewardsRes.rewards || []);
        setTotalRewards(rewardsRes.totalRewards || 0);
        setPendingRewards(rewardsRes.pendingRewards || 0);
        setUserStats(userStatsRes);
        setUnregisteredGames(unregisteredRes.games || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.email]);
  console.log(unregisteredGames);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          in_game_name: formData.inGameName,
          phone: formData.phone,
          bio: formData.bio,
        },
      });

      if (error) throw error;

      setUser({
        ...user,
        user_metadata: {
          full_name: formData.fullName,
          in_game_name: formData.inGameName,
          phone: formData.phone,
          bio: formData.bio,
        },
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Add loading indicator and handle claim reward
  const handleClaimReward = async (rewardId) => {
    const result = await claimReward(rewardId);
    if (result.success) {
      // Update rewards list after claiming
      const updatedRewards = rewards.map((r) =>
        r.id === rewardId ? { ...r, status: "claimed" } : r
      );
      setRewards(updatedRewards);
    }
  };

  

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your dashboard data...</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        {!loading && (
  <div className="flex items-center justify-between border-b border-border/20 pb-4">
    
    {/* LEFT: Tabs */}
    <div className="flex gap-2 overflow-x-auto">
      {[
        { id: "dashboard", label: "Dashboard", icon: "📊" },
        { id: "tournaments", label: "My Tournaments", icon: "🏆" },
        { id: "rewards", label: "Transactions & Rewards", icon: "🎁" },
        { id: "profile", label: "My Profile", icon: "👤" },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-2 font-medium whitespace-nowrap text-sm transition-all border-b-2 ${
            activeTab === tab.id
              ? "border-green-500 text-green-400"
              : "border-transparent text-foreground/60 hover:text-foreground"
          }`}
        >
          {tab.icon} {tab.label}
        </button>
      ))}
    </div>

    {/* RIGHT: Logout */}
    <button
      onClick={async () => {
        const { error } = await (await import("@/lib/supabase.js")).supabase.auth.signOut();
        if (!error) location.href = "/login";
      }}
      className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-500 transition-colors whitespace-nowrap"
    >
      🚪 Logout
    </button>
  </div>
)}

        {/* ============ DASHBOARD TAB ============ */}
        {!loading && activeTab === "dashboard" && (
          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-orbitron font-bold text-gradient">
                Welcome back, {formData.fullName || "Champion"}
              </h1>
              <p className="text-muted-foreground">
                Track your tournaments, matches, and rewards in one place
              </p>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-border/20 hover:border-green-500/30 transition-all hover:shadow-lg hover:shadow-green-500/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Registered Tournaments</CardTitle>
                  <Trophy className="h-5 w-5 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400">{stats.tournaments}</div>
                  <p className="text-xs text-muted-foreground mt-1">Active registrations</p>
                </CardContent>
              </Card>

              <Card className="border-border/20 hover:border-blue-500/30 transition-all hover:shadow-lg hover:shadow-blue-500/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ongoing Matches</CardTitle>
                  <Gamepad2 className="h-5 w-5 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-400">{stats.matches}</div>
                  <p className="text-xs text-muted-foreground mt-1">In progress</p>
                </CardContent>
              </Card>

              <Card className="border-border/20 hover:border-purple-500/30 transition-all hover:shadow-lg hover:shadow-purple-500/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Rank</CardTitle>
                  <Zap className="h-5 w-5 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-400">#{stats.rank}</div>
                  <p className="text-xs text-muted-foreground mt-1">Global ranking</p>
                </CardContent>
              </Card>

              <Card className="border-border/20 hover:border-yellow-500/30 transition-all hover:shadow-lg hover:shadow-yellow-500/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reward Points</CardTitle>
                  <Gift className="h-5 w-5 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-400">{stats.rewards}</div>
                  <p className="text-xs text-muted-foreground mt-1">Available to redeem</p>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Matches */}
            <div className="space-y-4">
              <h2 className="text-2xl font-orbitron font-bold">Upcoming Matches</h2>

              <div className="space-y-3">
                {upcomingMatches.map((match) => (
                  <Card
                    key={match.id}
                    className="border-border/20 hover:border-green-500/30 transition-all hover:shadow-lg hover:shadow-green-500/10"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{match.game}</h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                match.status === "Live"
                                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30"
                                  : "bg-white/5 border border-border/20 text-foreground"
                              }`}
                            >
                              {match.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{match.tournament}</p>
                          <div className="flex flex-wrap gap-4 pt-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar size={16} className="text-green-400" />
                              <span>{new Date(match.time).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock size={16} className="text-green-400" />
                              <span>{new Date(match.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Users size={16} className="text-green-400" />
                              <span className="font-mono">{match.roomId}</span>
                            </div>
                          </div>
                        </div>
                        <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 whitespace-nowrap">
                          View Match
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============ MY TOURNAMENTS TAB ============ */}
        {!loading && activeTab === "tournaments" && (
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-green-400" />
                <h1 className="text-3xl md:text-4xl font-orbitron font-bold text-gradient">
                  My Tournaments
                </h1>
              </div>
              <p className="text-muted-foreground">Manage and track all your tournament registrations</p>
            </div>

            {/* Tournaments Table */}
            <Card className="border-border/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/20 bg-white/5">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/70">Game</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/70">Tournament</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/70">Team</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/70">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/70">Prize Pool</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/70">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tournaments.map((tournament) => (
                      <tr key={tournament.id} className="border-b border-border/10 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold">
                          <span className="px-3 py-1 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20 text-green-300 border border-green-500/30">
                            {tournament.game.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <p className="font-medium">{tournament.name}</p>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-xs">
                              {tournament.team.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{tournament.team.toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              tournament.status === "Live"
                                ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30"
                                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            }`}
                          >
                            {tournament.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <p className="font-semibold text-green-400">{tournament.game.prize}</p>
                          <p className="text-xs text-muted-foreground mt-1">{tournament.participants} player</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="border-border/20 hover:border-green-500/50 hover:bg-green-500/10">
                              <Eye size={16} />
                              <span className="hidden sm:inline ml-2">View</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-border/20">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-2">Total Registrations</p>
                  <p className="text-3xl font-bold text-green-400">{tournaments.length}</p>
                </CardContent>
              </Card>

              <Card className="border-border/20">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-2">Active Tournaments</p>
                  <p className="text-3xl font-bold text-blue-400">
                    {tournaments.filter((t) => t.status === "Live" || t.status === "Upcoming").length}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/20">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-2">Total Invested</p>
                  <p className="text-3xl font-bold text-purple-400">₹{totalRewards}</p>
                </CardContent>
              </Card>
            </div>

            {/* Available Games for Registration */}
            {unregisteredGames.length > 0 && (
              <div className="space-y-4 mt-8 pt-8 border-t border-border/20">
                <div className="space-y-2">
                  <h2 className="text-2xl font-orbitron font-bold">Register for More Games</h2>
                  <p className="text-muted-foreground">Explore and register for new tournaments in different games</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {unregisteredGames.map((game) => (
                    <Card key={`${game.eventId}-${game.id}`} className="glass-card electric-border overflow-hidden">
                      <div className="relative h-40">
                        <img src={game.image} alt={game.name} className="w-full h-full object-cover" />
                      </div>
                      <CardHeader className="flex items-center justify-between">
                        <CardTitle className="font-orbitron">{game.name} </CardTitle>
                        <div className="font-orbitron text-sm text-muted-foreground font-semibold">
                          Event: <span className="font-orbitron text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)] font-bold">
                            {game.eventTitle}
                          </span>
                        <div className=" font-orbitron text-sm text-muted-foreground font-semibold">
                    Prize pool: <span className="font-orbitron text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)] font-bold">
  ₹{game.gameprize}
</span>


                  </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Participants:</span>
                            <span className="font-semibold">{game.participants}</span>
                          </div>
                          {game.gameHead && (
                            <div className="text-sm">
                              <p className="text-muted-foreground mb-1">Game Head:</p>
                              <p className="font-semibold">{game.gameHead.name}</p>
                              <p className="text-xs text-muted-foreground">{game.gameHead.phone}</p>
                            </div>
                          )}
                           <div>
                    <a href={game?.gamebrochure} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full font-orbitron mb-2">
                        View Details
                      </Button>
                    </a>
                    <a href={`/events/${game.eventId}/register/${game.id}`} target="_blank" rel="noopener noreferrer">
<Button
  className="w-full font-orbitron"
>
  Register Team
</Button>

</a>



                    
                  </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============ RESULTS & REWARDS TAB ============ */}
        {!loading && activeTab === "rewards" && (
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-green-400" />
                <h1 className="text-3xl md:text-4xl font-orbitron font-bold text-gradient">
                  Trasactions & Rewards
                </h1>
              </div>
              <p className="text-muted-foreground">Track your tournament transactions and earned rewards</p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-border/20 hover:border-green-500/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Total Transactions</p>
                    <Gift className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-3xl font-bold text-green-400">₹{totalRewards}</p>
                </CardContent>
              </Card>

              <Card className="border-border/20 hover:border-blue-500/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Pending Rewards</p>
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-3xl font-bold text-blue-400">₹{pendingRewards}</p>
                </CardContent>
              </Card>

              <Card className="border-border/20 hover:border-purple-500/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                    <Award className="w-5 h-5 text-purple-400" />
                  </div>
                  <p className="text-3xl font-bold text-purple-400">75%</p>
                </CardContent>
              </Card>
            </div>

            {/* Rewards List */}
            <div className="space-y-4">
              <h2 className="text-xl font-orbitron font-bold">Transactions & Reward History</h2>

              <div className="space-y-2">
                {rewards.map((reward) => (
                  <Card key={reward.id} className="border-border/20 hover:border-green-500/30 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold">{reward.title}</p>
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                reward.status === "Claimed"
                                  ? "bg-green-500/20 text-green-300"
                                  : "bg-yellow-500/20 text-yellow-300"
                              }`}
                            >
                              {reward.status}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/60">{reward.game}</p>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="text-2xl font-bold text-green-400">+₹{reward.amount}</p>
                        </div>

                        {reward.status === "pending" && (
                          <Button
                            onClick={() => handleClaimReward(reward.id)}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-xs"
                          >
                            Claim
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============ MY PROFILE TAB ============ */}
        {!loading && activeTab === "profile" && user && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <User className="w-8 h-8 text-green-400" />
                  <h1 className="text-3xl md:text-4xl font-orbitron font-bold text-gradient">
                    My Profile
                  </h1>
                </div>
                <p className="text-muted-foreground">Manage your profile information</p>
              </div>
              <Button
                onClick={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
                disabled={isSaving}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 gap-2"
              >
                {isEditing ? (
                  <>
                    <Save size={20} />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit2 size={20} />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Avatar & Stats */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="border-border/20 text-center">
                  <CardContent className="p-8">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-5xl mx-auto shadow-lg shadow-green-500/30 mb-4">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="text-2xl font-bold mt-4">{formData.fullName || "Player"}</h2>
                    <p className="text-sm text-muted-foreground mt-2">{formData.inGameName || "No in-game name set"}</p>
                  </CardContent>
                </Card>

                <Card className="border-border/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Trophy size={20} className="text-green-400" />
                      Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center pb-4 border-b border-border/20">
                      <p className="text-xs text-muted-foreground mb-1">Tournaments Joined</p>
                      <p className="text-3xl font-bold text-green-400">{userStats.tournamentsJoined}</p>
                    </div>
                    <div className="text-center pb-4 border-b border-border/20">
                      <p className="text-xs text-muted-foreground mb-1">Matches Played</p>
                      <p className="text-3xl font-bold text-blue-400">{userStats.matchesPlayed}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Win Rate</p>
                      <p className="text-3xl font-bold text-purple-400">{userStats.winRate.toFixed(1)}%</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Profile Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card className="border-border/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User size={20} className="text-green-400" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground/70 mb-2 block">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 bg-white/5 border border-border/20 rounded-lg focus:outline-none focus:border-green-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground/70 mb-2 block">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full px-4 py-2 bg-white/5 border border-border/20 rounded-lg cursor-not-allowed opacity-50"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground/70 mb-2 block">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 bg-white/5 border border-border/20 rounded-lg focus:outline-none focus:border-green-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Gaming Information */}
                <Card className="border-border/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gamepad2 size={20} className="text-green-400" />
                      Gaming Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground/70 mb-2 block">
                        In-Game Name
                      </label>
                      <input
                        type="text"
                        name="inGameName"
                        value={formData.inGameName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 bg-white/5 border border-border/20 rounded-lg focus:outline-none focus:border-green-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Your gaming username"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground/70 mb-2 block">
                        Bio / Description
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        rows={4}
                        className="w-full px-4 py-2 bg-white/5 border border-border/20 rounded-lg focus:outline-none focus:border-green-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Registration Dialog */}
      {selectedGameForRegistration && (
        <RegisterTeamDialog
          open={registrationDialogOpen}
          onOpenChange={setRegistrationDialogOpen}
          eventId={selectedGameForRegistration.eventId}
          game={selectedGameForRegistration}
        />
      )}
    </DashboardLayout>
  );
}
