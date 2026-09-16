import React, { useState, useEffect } from "react";
import {
  Users,
  Radio,
  Activity,
  Sparkles,
  BookOpen,
  FileCheck,
  Variable,
  FunctionSquare,
  BarChart,
  Shapes,
  Compass,
  Zap,
  CheckCircle2,
  Flame,
  Target,
  Clock,
  ArrowRight,
  LogOut,
  Smile,
  Send,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import { UserProfile, SATDomain } from "../types";
import {
  INITIAL_PEER_STUDY_ROOMS,
  PeerStudyRoom,
  PeerStudent,
} from "../data/peerStudyRoomsData";
import {
  getSavedActiveRoomId,
  saveActiveRoomId,
  getSavedPersonalStatus,
  savePersonalStatus,
  calculateCategoryCounts,
  createPeerStudentFromProfile,
} from "../services/studyRoomService";

interface PeerStudyRoomsProps {
  currentProfile?: UserProfile;
  onStartPractice?: (sectionFilter?: string, domainFilter?: string) => void;
  onOpenFormulaGuide?: () => void;
  onJumpToLesson?: (domain: string) => void;
}

const STATUS_PRESETS = [
  "⚡ Drilling hard questions",
  "📖 Reviewing theory notes",
  "⏱️ Speed timing run",
  "🎯 Targeting 800 domain score",
  "🔍 Resolving error log items",
  "💡 Studying Desmos shortcuts",
];

export const PeerStudyRooms: React.FC<PeerStudyRoomsProps> = ({
  currentProfile,
  onStartPractice,
  onOpenFormulaGuide,
  onJumpToLesson,
}) => {
  const [rooms, setRooms] = useState<PeerStudyRoom[]>(INITIAL_PEER_STUDY_ROOMS);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(() => getSavedActiveRoomId());
  const [selectedRoomId, setSelectedRoomId] = useState<string>(() => {
    return getSavedActiveRoomId() || INITIAL_PEER_STUDY_ROOMS[0].id;
  });
  const [activeCategoryTab, setActiveCategoryTab] = useState<"All" | "Math" | "Reading & Writing" | "Strategy & Foundations">("All");
  const [personalStatus, setPersonalStatus] = useState<string>(() => getSavedPersonalStatus());
  const [isEditingStatus, setIsEditingStatus] = useState<boolean>(false);
  const [statusInput, setStatusInput] = useState<string>(personalStatus);
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [cheerNotification, setCheerNotification] = useState<string | null>(null);
  const [roomFeedInput, setRoomFeedInput] = useState<string>("");
  const [roomFeeds, setRoomFeeds] = useState<Record<string, string[]>>({});

  // Real-time student counts per category
  const categoryCounts = calculateCategoryCounts(rooms, activeRoomId);

  // Active room timer
  useEffect(() => {
    if (!activeRoomId) {
      setSessionSeconds(0);
      return;
    }
    const timer = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeRoomId]);

  // Gentle periodic simulated peer presence heartbeat
  useEffect(() => {
    const interval = setInterval(() => {
      setRooms((prevRooms) => {
        return prevRooms.map((room) => {
          // Slight natural fluctuation of +/- 1 student in random room
          const shouldFluctuate = Math.random() > 0.65;
          if (!shouldFluctuate) return room;
          const delta = Math.random() > 0.45 ? 1 : -1;
          const newCount = Math.max(10, room.baseActiveCount + delta);
          return {
            ...room,
            baseActiveCount: newCount,
          };
        });
      });
    }, 18000);
    return () => clearInterval(interval);
  }, []);

  const handleJoinRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    setSelectedRoomId(roomId);
    saveActiveRoomId(roomId);
    setSessionSeconds(0);

    // Add notification to room feed
    const joinedRoom = rooms.find((r) => r.id === roomId);
    if (joinedRoom && currentProfile) {
      const joinMsg = `${currentProfile.name} joined the study room (${personalStatus})`;
      setRoomFeeds((prev) => ({
        ...prev,
        [roomId]: [joinMsg, ...(prev[roomId] || joinedRoom.recentActivityMilestones)],
      }));
    }
  };

  const handleLeaveRoom = () => {
    if (activeRoomId && currentProfile) {
      const leftRoomId = activeRoomId;
      const leaveMsg = `${currentProfile.name} left the room after ${(sessionSeconds / 60).toFixed(0)}m`;
      setRoomFeeds((prev) => ({
        ...prev,
        [leftRoomId]: [leaveMsg, ...(prev[leftRoomId] || [])],
      }));
    }
    setActiveRoomId(null);
    saveActiveRoomId(null);
    setSessionSeconds(0);
  };

  const handleSaveStatus = (newStatus: string) => {
    setPersonalStatus(newStatus);
    savePersonalStatus(newStatus);
    setIsEditingStatus(false);
  };

  const handleSendCheer = (peerId: string, peerName: string) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) => {
        if (room.id !== selectedRoomId) return room;
        return {
          ...room,
          peers: room.peers.map((peer) => {
            if (peer.id === peerId) {
              return { ...peer, cheersCount: peer.cheersCount + 1 };
            }
            return peer;
          }),
        };
      })
    );
    setCheerNotification(`Sent high five to ${peerName}! 👏🔥`);
    setTimeout(() => setCheerNotification(null), 3000);
  };

  const handlePostRoomNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomFeedInput.trim() || !currentProfile) return;
    const newNote = `${currentProfile.name}: "${roomFeedInput.trim()}"`;
    setRoomFeeds((prev) => ({
      ...prev,
      [selectedRoomId]: [newNote, ...(prev[selectedRoomId] || currentSelectedRoom?.recentActivityMilestones || [])],
    }));
    setRoomFeedInput("");
  };

  const currentSelectedRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];
  const isCurrentlyInSelectedRoom = activeRoomId === selectedRoomId;

  // Render icon for domain
  const renderRoomIcon = (iconName: string, className = "w-5 h-5") => {
    switch (iconName) {
      case "Variable":
        return <Variable className={className} />;
      case "FunctionSquare":
        return <FunctionSquare className={className} />;
      case "BarChart":
        return <BarChart className={className} />;
      case "Shapes":
        return <Shapes className={className} />;
      case "BookOpen":
        return <BookOpen className={className} />;
      case "FileCheck":
        return <FileCheck className={className} />;
      case "Compass":
        return <Compass className={className} />;
      case "Sparkles":
        return <Sparkles className={className} />;
      default:
        return <BookOpen className={className} />;
    }
  };

  // Filtered rooms list
  const filteredRooms = rooms.filter((r) => {
    if (activeCategoryTab === "All") return true;
    return r.sectionCategory === activeCategoryTab;
  });

  // Current room peers list (including user if active in room)
  const currentRoomPeers: PeerStudent[] = [
    ...(isCurrentlyInSelectedRoom && currentProfile
      ? [createPeerStudentFromProfile(currentProfile, personalStatus, Math.max(1, Math.floor(sessionSeconds / 60)))]
      : []),
    ...currentSelectedRoom.peers,
  ];

  const currentMilestones = roomFeeds[currentSelectedRoom.id] || currentSelectedRoom.recentActivityMilestones;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Real-time Category Telemetry Banner */}
      <div className="scifi-glass-card rounded-3xl border border-cyan-500/30 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              REAL-TIME PEER SYNCHRONIZATION MATRIX
            </div>
            <h2 className="text-2xl sm:text-3xl font-orbitron font-bold text-white tracking-wide drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
              Peer Study Rooms & Active Presence
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm font-space leading-relaxed">
              Connect into virtual domain study rooms to see who else is currently preparing in the same SAT topic. Exchange peer cheers, collaborate on tough trap analysis, and launch focused drills together.
            </p>
          </div>

          {/* Active Category Breakdown Ticker */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Total Online */}
            <div className="bg-slate-900/90 border border-cyan-500/30 p-3.5 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 font-mono text-[10px] uppercase font-bold">
                <span>Total Active</span>
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              </div>
              <div className="text-2xl font-orbitron font-black text-cyan-300 drop-shadow-[0_0_8px_#00f0ff] mt-1">
                {categoryCounts.total}
              </div>
              <div className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Live in Academy
              </div>
            </div>

            {/* Math Categories */}
            <div className="bg-slate-900/90 border border-cyan-500/30 p-3.5 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 font-mono text-[10px] uppercase font-bold">
                <span>Math Domains</span>
                <Variable className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-2xl font-orbitron font-black text-cyan-400 mt-1">
                {categoryCounts.math}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-1">
                4 Categories
              </div>
            </div>

            {/* Reading & Writing Categories */}
            <div className="bg-slate-900/90 border border-cyan-500/30 p-3.5 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 font-mono text-[10px] uppercase font-bold">
                <span>R&W Domains</span>
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-2xl font-orbitron font-black text-amber-400 mt-1">
                {categoryCounts.readingWriting}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-1">
                4 Categories
              </div>
            </div>

            {/* Strategy Category */}
            <div className="bg-slate-900/90 border border-cyan-500/30 p-3.5 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 font-mono text-[10px] uppercase font-bold">
                <span>Strategy</span>
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-2xl font-orbitron font-black text-purple-400 mt-1">
                {categoryCounts.strategy}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-1">
                1 Category
              </div>
            </div>
          </div>
        </div>

        {/* User's Current Room Active Status Bar */}
        {activeRoomId && (
          <div className="mt-6 pt-4 border-t border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-cyan-950/40 -mx-6 -mb-6 p-4 px-6 border-b border-cyan-500/30">
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400 absolute inset-0 animate-ping" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                  <span>ACTIVE IN ROOM:</span>
                  <span className="text-cyan-300">
                    {rooms.find((r) => r.id === activeRoomId)?.name}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Clock className="w-3 h-3" />
                    Session: {Math.floor(sessionSeconds / 60)}m {sessionSeconds % 60}s
                  </span>
                  <span>•</span>
                  <span className="text-slate-300">"{personalStatus}"</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setSelectedRoomId(activeRoomId)}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold transition flex items-center gap-1.5"
              >
                <Target className="w-3.5 h-3.5" />
                View My Room
              </button>
              <button
                onClick={handleLeaveRoom}
                className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold transition flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Leave Room
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cheer Floating Toast */}
      {cheerNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-cyan-950 border border-cyan-400 text-cyan-200 px-4 py-3 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 font-mono text-xs font-bold">
          <Smile className="w-5 h-5 text-amber-400 animate-bounce" />
          <span>{cheerNotification}</span>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {(["All", "Math", "Reading & Writing", "Strategy & Foundations"] as const).map((cat) => {
            const count =
              cat === "All"
                ? categoryCounts.total
                : cat === "Math"
                ? categoryCounts.math
                : cat === "Reading & Writing"
                ? categoryCounts.readingWriting
                : categoryCounts.strategy;

            const isSelected = activeCategoryTab === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategoryTab(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all border flex items-center gap-2 ${
                  isSelected
                    ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                    : "scifi-glass-card text-slate-400 hover:text-slate-200 border-cyan-500/10 hover:border-cyan-500/30"
                }`}
              >
                <span>{cat === "All" ? "All Categories" : cat}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    isSelected ? "bg-black/30 text-black" : "bg-cyan-950 text-cyan-400 border border-cyan-500/30"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Real-time presence updates automatically</span>
        </div>
      </div>

      {/* MAIN LAYOUT: ROOM CARDS & ACTIVE DETAIL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Virtual Room Directory */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              Available Virtual Rooms ({filteredRooms.length})
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Click to enter or inspect</span>
          </div>

          <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
            {filteredRooms.map((room) => {
              const isSelected = selectedRoomId === room.id;
              const isJoined = activeRoomId === room.id;
              const roomActiveCount = categoryCounts.byRoomId[room.id] || room.baseActiveCount;

              return (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? `bg-slate-900/90 ${room.colorScheme.border} ${room.colorScheme.glow}`
                      : "scifi-glass-card border-cyan-500/10 hover:border-cyan-500/30 hover:bg-slate-900/60"
                  }`}
                >
                  {/* Category Accent Stripe */}
                  <div
                    className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                      room.sectionCategory === "Math"
                        ? "bg-cyan-500"
                        : room.sectionCategory === "Reading & Writing"
                        ? "bg-amber-500"
                        : "bg-purple-500"
                    }`}
                  />

                  <div className="pl-2 space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-2 rounded-xl bg-slate-950 border border-cyan-500/20 ${room.colorScheme.text}`}
                        >
                          {renderRoomIcon(room.iconName)}
                        </div>
                        <div>
                          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider text-[10px]">
                            {room.sectionCategory} • {room.badge}
                          </div>
                          <h4 className="text-sm font-orbitron font-bold text-white leading-snug">
                            {room.name}
                          </h4>
                        </div>
                      </div>

                      {/* Active student count badge */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950 border border-cyan-500/30 text-emerald-400 font-mono text-xs font-bold whitespace-nowrap shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{roomActiveCount} Active</span>
                      </div>
                    </div>

                    <p className="text-xs font-space text-slate-300 line-clamp-2 leading-relaxed">
                      {room.description}
                    </p>

                    {/* Current Focus Topic */}
                    <div className="bg-slate-950/80 rounded-xl p-2 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-2">
                      <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">Topic: {room.currentTopic}</span>
                    </div>

                    {/* Avatars Preview & Action Button */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center -space-x-2">
                        {room.peers.slice(0, 3).map((peer) => (
                          <div
                            key={peer.id}
                            title={`${peer.name} (${peer.targetScore} Target)`}
                            className={`w-6 h-6 rounded-full border border-slate-950 ${peer.avatarColor} text-white text-[9px] font-bold flex items-center justify-center`}
                          >
                            {peer.name[0]}
                          </div>
                        ))}
                        <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-950 text-slate-300 text-[9px] font-bold flex items-center justify-center">
                          +{roomActiveCount - 3}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isJoined ? (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-500 text-emerald-300 text-[11px] font-mono font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Active Inside
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJoinRoom(room.id);
                            }}
                            className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-[11px] font-mono font-bold transition shadow-[0_0_8px_rgba(6,182,212,0.3)] flex items-center gap-1"
                          >
                            <span>Join Room</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Room Live Hub */}
        <div className="lg:col-span-7 space-y-4">
          <div className="scifi-glass-card rounded-3xl border border-cyan-500/30 p-6 space-y-6 relative overflow-hidden">
            {/* Room Header Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-5">
              <div className="flex items-start gap-3">
                <div
                  className={`p-3 rounded-2xl bg-slate-950 border border-cyan-500/30 ${currentSelectedRoom.colorScheme.text}`}
                >
                  {renderRoomIcon(currentSelectedRoom.iconName, "w-6 h-6")}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                      {currentSelectedRoom.sectionCategory}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {currentSelectedRoom.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-orbitron font-bold text-white mt-1">
                    {currentSelectedRoom.name}
                  </h3>
                </div>
              </div>

              {/* Join / Switch Button */}
              <div>
                {isCurrentlyInSelectedRoom ? (
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>You Are Present</span>
                    </div>
                    <button
                      onClick={handleLeaveRoom}
                      className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 transition"
                      title="Leave Room"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleJoinRoom(currentSelectedRoom.id)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-mono font-bold text-xs tracking-wide transition shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center gap-2"
                  >
                    <Radio className="w-4 h-4" />
                    <span>Join This Room ({categoryCounts.byRoomId[currentSelectedRoom.id] || currentSelectedRoom.baseActiveCount} Peers)</span>
                  </button>
                )}
              </div>
            </div>

            {/* If user is in this room: Status customizer */}
            {isCurrentlyInSelectedRoom && (
              <div className="bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-4 space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>YOUR LIVE STATUS IN THIS ROOM</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">
                    Visible to {categoryCounts.byRoomId[currentSelectedRoom.id] || currentSelectedRoom.baseActiveCount} peers
                  </span>
                </div>

                {isEditingStatus ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={statusInput}
                      onChange={(e) => setStatusInput(e.target.value)}
                      placeholder="What are you working on right now?"
                      className="flex-1 bg-slate-950 border border-cyan-500/40 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      onClick={() => handleSaveStatus(statusInput)}
                      className="px-3 py-1.5 bg-cyan-500 text-black rounded-xl text-xs font-mono font-bold"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingStatus(false)}
                      className="px-2 py-1.5 text-slate-400 hover:text-white text-xs font-mono"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-space text-white font-medium italic">
                      "{personalStatus}"
                    </div>
                    <button
                      onClick={() => {
                        setStatusInput(personalStatus);
                        setIsEditingStatus(true);
                      }}
                      className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline ml-3"
                    >
                      Update Status
                    </button>
                  </div>
                )}

                {/* Status Quick Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {STATUS_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handleSaveStatus(preset)}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-slate-300 text-[10px] font-mono transition"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Domain Action Launcher Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => {
                  if (onStartPractice) {
                    onStartPractice(
                      currentSelectedRoom.sectionCategory === "Math" ? "Math" : "Reading & Writing",
                      currentSelectedRoom.domain === "General Strategy" ? undefined : currentSelectedRoom.domain
                    );
                  }
                }}
                className="p-3 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-left transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Action</div>
                  <div className="text-xs font-orbitron font-bold text-white">Start Practice Drill</div>
                </div>
                <Zap className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
              </button>

              {onJumpToLesson && currentSelectedRoom.domain !== "General Strategy" && (
                <button
                  onClick={() => onJumpToLesson(currentSelectedRoom.domain)}
                  className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-left transition flex items-center justify-between group"
                >
                  <div>
                    <div className="text-[10px] font-mono text-amber-400 font-bold uppercase">Theory</div>
                    <div className="text-xs font-orbitron font-bold text-white">Open Lesson Matrix</div>
                  </div>
                  <BookOpen className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
                </button>
              )}

              {onOpenFormulaGuide && (
                <button
                  onClick={onOpenFormulaGuide}
                  className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-left transition flex items-center justify-between group"
                >
                  <div>
                    <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Cheat Sheet</div>
                    <div className="text-xs font-orbitron font-bold text-white">Formulas & Rules</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
                </button>
              )}
            </div>

            {/* High-Yield Domain Concepts & Trap Alert */}
            <div className="bg-slate-950/90 rounded-2xl p-4 border border-cyan-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  Room Study Focus & Key Principles
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {currentSelectedRoom.domain}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-space">
                {currentSelectedRoom.keyConcepts.map((concept, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-300 flex items-start gap-2"
                  >
                    <span className="text-cyan-400 font-mono font-bold text-[10px] mt-0.5">#{idx + 1}</span>
                    <span>{concept}</span>
                  </div>
                ))}
              </div>

              {/* Trap warning */}
              <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 flex items-start gap-2.5 text-xs font-space text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300 font-mono uppercase text-[10px] block">
                    Trap Analysis for this Domain:
                  </span>
                  {currentSelectedRoom.commonTrapWarning}
                </div>
              </div>
            </div>

            {/* Active Students List in this Domain */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  Active Peers in this Room ({currentRoomPeers.length} Active)
                </h4>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>

              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {currentRoomPeers.map((peer) => {
                  const isYou = peer.id.startsWith("current-user");

                  return (
                    <div
                      key={peer.id}
                      className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isYou
                          ? "bg-cyan-950/50 border-cyan-400/80 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                          : "bg-slate-900/70 border-slate-800 hover:border-cyan-500/30"
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-2xl ${peer.avatarColor} text-white font-orbitron font-bold flex items-center justify-center text-sm shadow-md shrink-0`}
                        >
                          {peer.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-orbitron font-bold text-white">
                              {peer.name}
                            </span>
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                                peer.role === "admin"
                                  ? "bg-cyan-950 text-cyan-300 border border-cyan-500/40"
                                  : peer.role === "tutor"
                                  ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                                  : "bg-indigo-950 text-indigo-300 border border-indigo-500/40"
                              }`}
                            >
                              {peer.role} • {peer.tier}
                            </span>
                            {isYou && (
                              <span className="text-[9px] font-mono bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/40 font-bold">
                                YOU
                              </span>
                            )}
                          </div>

                          <p className="text-xs font-space text-slate-300 mt-1">
                            {peer.currentStatus}
                          </p>

                          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 mt-1">
                            <span>Target: <strong className="text-amber-400">{peer.targetScore}</strong></span>
                            <span>•</span>
                            <span>Streak: <strong className="text-emerald-400">{peer.streakDays}d</strong></span>
                            <span>•</span>
                            <span>In Room: {peer.timeInRoomMinutes}m</span>
                          </div>
                        </div>
                      </div>

                      {/* Cheer / High Five Action */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {!isYou ? (
                          <button
                            onClick={() => handleSendCheer(peer.id, peer.name)}
                            className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-cyan-950 border border-cyan-500/30 text-cyan-300 hover:text-white text-xs font-mono font-bold transition flex items-center gap-1.5 shadow-sm"
                          >
                            <Smile className="w-3.5 h-3.5 text-amber-400" />
                            <span>Cheer</span>
                            <span className="text-[10px] text-slate-400">({peer.cheersCount})</span>
                          </button>
                        ) : (
                          <div className="text-[10px] font-mono text-slate-400 italic">
                            Your Active Session
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Room Live Feed & Encouragements */}
            <div className="bg-slate-950/80 rounded-2xl p-4 border border-cyan-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  Room Milestone Stream
                </span>
                <span className="text-[10px] font-mono text-slate-500">Live Peer Feed</span>
              </div>

              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {currentMilestones.map((milestone, idx) => (
                  <div
                    key={idx}
                    className="text-xs font-space text-slate-300 p-2 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                    <span>{milestone}</span>
                  </div>
                ))}
              </div>

              {/* Room Quick Post */}
              {isCurrentlyInSelectedRoom && (
                <form onSubmit={handlePostRoomNote} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={roomFeedInput}
                    onChange={(e) => setRoomFeedInput(e.target.value)}
                    placeholder="Share a quick tip or cheer the room..."
                    className="flex-1 bg-slate-900 border border-cyan-500/30 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold transition flex items-center gap-1.5"
                  >
                    <Send className="w-3 h-3" />
                    <span>Post</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
