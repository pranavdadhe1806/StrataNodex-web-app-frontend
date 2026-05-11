interface WelcomeHeaderProps {
  userName: string;
  streak: number;
}

function getStreakMessage(streak: number): string {
  if (streak === 0) {
    return "Let's get started — build your first streak! 💪";
  }
  if (streak === 1) {
    return "Good start! Keep it going tomorrow. ⚡";
  }
  if (streak >= 2 && streak <= 3) {
    return "You're building momentum! 🚀";
  }
  if (streak >= 4 && streak <= 6) {
    return "You're on a roll! Don't break it. 🔥";
  }
  if (streak >= 7 && streak <= 13) {
    return "You have been on fire lately....... 🔥";
  }
  if (streak >= 14 && streak <= 29) {
    return "Incredible consistency! You're unstoppable. 🔥🔥";
  }
  return "Legendary streak. You're a machine. 🔥🔥🔥";
}

export default function WelcomeHeader({ userName, streak }: WelcomeHeaderProps) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <h1
        style={{
          color: '#EDEFF3',
          fontFamily: 'Poppins, sans-serif',
          fontSize: '26px',
          fontWeight: 600,
          margin: '0 0 6px 0',
        }}
      >
        Welcome Back, {userName}
      </h1>
      <p
        style={{
          color: '#8A8F98',
          fontFamily: 'Poppins, sans-serif',
          fontSize: '14px',
          fontWeight: 400,
          margin: 0,
        }}
      >
        {getStreakMessage(streak)}
      </p>
    </div>
  );
}
