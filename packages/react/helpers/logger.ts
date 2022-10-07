export default function (...messages: any) {
  let enableLogs = false;

  if (process.env.NEXT_PUBLIC_DEBUG === "true") {
    enableLogs = true;
  }

  if (enableLogs) {
    console.log(...messages);
  }
}
