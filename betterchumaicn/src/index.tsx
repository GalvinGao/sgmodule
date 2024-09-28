import { render } from "preact";

import { useCallback, useEffect, useState } from "preact/hooks";
import { QRCodeSVG } from "qrcode.react";
import "virtual:uno.css";
import "./style.css";

import { formatDistance } from "date-fns";
import { ja } from "date-fns/locale";

function copyToClipboard(string: string) {
  let textarea: HTMLTextAreaElement;
  let result: boolean;

  try {
    textarea = document.createElement("textarea");
    textarea.setAttribute("readonly", "true");
    textarea.setAttribute("contenteditable", "true");
    textarea.style.position = "fixed"; // prevent scroll from jumping to the bottom when focus is set.
    textarea.value = string;

    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();

    const range = document.createRange();
    range.selectNodeContents(textarea);

    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    textarea.setSelectionRange(0, textarea.value.length);
    result = document.execCommand("copy");
  } catch (err) {
    console.error(err);
    result = null;
  } finally {
    document.body.removeChild(textarea);
  }

  // manual copy fallback using prompt
  if (!result) {
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const copyHotkey = isMac ? "⌘C" : "CTRL+C";
    prompt(`Press ${copyHotkey}`, string); // eslint-disable-line no-alert
  }
}

function getPageData(): {
  imageId: string;
  expiresAt: string;
} {
  // extract `imageId` from IMAGE_ID.html within the URL
  const imageId = window.location.pathname.match(/\/(\w+)\.html/)[1];

  // extract `expiresAt` from the `?l=` query string
  const expiresAt = new URLSearchParams(window.location.search).get("l");

  if (expiresAt) {
    return {
      imageId,
      expiresAt,
    };
  }

  const searchParams = new URLSearchParams(window.location.search);
  return Object.fromEntries(searchParams.entries()) as {
    imageId: string;
    expiresAt: string;
  };
}

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        d="M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12z"
      />
    </svg>
  );
}

function TimerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <rect x="0" y="0" width="24" height="24" fill="none" stroke="none" />
      <path
        fill="currentColor"
        d="M6 2h12v6l-4 4l4 4v6H6v-6l4-4l-4-4zm10 14.5l-4-4l-4 4V20h8zm-4-5l4-4V4H8v3.5zM10 6h4v.75l-2 2l-2-2z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.25em"
      height="1.25em"
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        d="m9.55 18l-5.7-5.7l1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4z"
      />
    </svg>
  );
}

function ImportIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        d="M12 3C8.59 3 5.69 4.07 4.54 5.57l5.25 5.25c.71.11 1.43.18 2.21.18 4.42 0 8-1.79 8-4s-3.58-4-8-4M3.92 7.08 2.5 8.5 5 11H0v2h5l-2.5 2.5 1.42 1.42L8.84 12M20 9c0 2.21-3.58 4-8 4-.66 0-1.3-.05-1.91-.13l-2.47 2.47c1.26.41 2.76.66 4.38.66 4.42 0 8-1.79 8-4m0 2c0 2.21-3.58 4-8 4-2.28 0-4.33-.5-5.79-1.25l-1.68 1.68C5.68 19.93 8.59 21 12 21c4.42 0 8-1.79 8-4"
      />
    </svg>
  );
}

function Pill({
  children,
  class: className,
  Component = "div",
  ...props
}: {
  children: preact.ComponentChildren;
  class?: string;
  Component?: "div" | "button" | "a";
} & (typeof Component extends "button"
  ? React.ComponentProps<typeof Component>
  : {})) {
  return (
    <Component
      class={`bg-black/60 px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-md shadow-medium text-white ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 1000);
    }
  }, [copied]);

  return (
    <Pill
      Component="button"
      onClick={() => {
        copyToClipboard(content);
        setCopied(true);
      }}
      class="border-none active:scale-95 active:opacity-80 transition-all tracking-tighter text-sm"
    >
      {copied ? (
        <>
          <CheckIcon />
        </>
      ) : (
        <>
          <CopyIcon />
          <span>コピー</span>
        </>
      )}
    </Pill>
  );
}

function ImportToLXNSButton() {
  return (
    <Pill
      Component="a"
      href="https://maimai.lxns.net/api/v0/maimai/wechat/auth"
      class="border-none active:scale-95 active:opacity-80 transition-all tracking-tighter decoration-none text-sm"
    >
      <ImportIcon />
      <span>データインポート</span>
    </Pill>
  );
}

function Timer({ expiresAt }: { expiresAt: string }) {
  const [formattedExpiresAt, setFormattedExpiresAt] = useState<{
    remaining: string;
    expired: boolean;
  }>({
    remaining: "--",
    expired: false,
  });

  const format = useCallback((expiresAt: string) => {
    const expiresAtDate = new Date(parseInt(expiresAt) * 1000);
    const now = new Date();
    const diffInSeconds = (expiresAtDate.getTime() - now.getTime()) / 1000;

    if (diffInSeconds > 0) {
      const remaining = formatDistance(expiresAtDate, now, {
        locale: ja,
        includeSeconds: true,
      });
      return {
        remaining,
        expired: false,
      };
    } else {
      const expired = formatDistance(now, expiresAtDate, {
        locale: ja,
        includeSeconds: true,
      });
      return {
        remaining: expired,
        expired: true,
      };
    }
  }, []);

  useEffect(() => {
    const updateTimer = () => {
      setFormattedExpiresAt(format(expiresAt));
    };

    updateTimer(); // Initial update
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, format]);

  const expiresAtDate = new Date(parseInt(expiresAt) * 1000);

  return (
    <Pill class={formattedExpiresAt.expired ? "!bg-red-800/70" : ""}>
      <TimerIcon />
      <div class="flex flex-col gap-1">
        <span class="[&_span]:leading-none flex items-baseline flex-nowrap pb-0.5 tracking-wide tabular-nums">
          {formattedExpiresAt.expired ? (
            <>
              <span class="text-base">{formattedExpiresAt.remaining}前に</span>
              <span class="text-sm">期限切れ</span>
            </>
          ) : (
            <>
              <span class="text-sm">有効期限まで</span>
              <span class="text-lg">あと{formattedExpiresAt.remaining}</span>
            </>
          )}
        </span>
        <span class="text-xs opacity-60 leading-none tabular-nums tracking-tight">
          {expiresAtDate.toLocaleString("ja-JP", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </span>
      </div>
    </Pill>
  );
}

export function App() {
  const pageData = getPageData();

  const qrcodeContent = "SGWC" + pageData.imageId;
  const expired = new Date(parseInt(pageData.expiresAt) * 1000) < new Date();
  const [qrMode, setQrMode] = useState<"standard" | "high-contrast" | "backup">(
    "standard"
  );

  return (
    <div class="flex flex-col items-center justify-center h-full relative">
      <div class="absolute top-24 left-1/2 -translate-x-1/2 flex items-center gap-3">
        <img
          src="https://shama.dxrating.net/images/favicon/maimai.png"
          class="size-6"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          class="size-8 opacity-60"
        >
          <rect x="0" y="0" width="24" height="24" fill="none" stroke="none" />
          <path
            fill="currentColor"
            d="M4 4h6v6H4zm16 0v6h-6V4zm-6 11h2v-2h-2v-2h2v2h2v-2h2v2h-2v2h2v3h-2v2h-2v-2h-3v2h-2v-4h3zm2 0v3h2v-3zM4 20v-6h6v6zM6 6v2h2V6zm10 0v2h2V6zM6 16v2h2v-2zm-2-5h2v2H4zm5 0h4v4h-2v-2H9zm2-5h2v4h-2zM2 2v4H0V2a2 2 0 0 1 2-2h4v2zm20-2a2 2 0 0 1 2 2v4h-2V2h-4V0zM2 18v4h4v2H2a2 2 0 0 1-2-2v-4zm20 4v-4h2v4a2 2 0 0 1-2 2h-4v-2z"
          />
        </svg>
        <img
          src="https://shama.dxrating.net/images/favicon/chunithm.png"
          class="size-6"
        />
      </div>

      <div class="absolute bottom-[calc(env(safe-area-inset-bottom)+4rem)] flex flex-col gap-2 justify-center text-white">
        <div class="flex items-center gap-2 w-full justify-center">
          <CopyButton content={qrcodeContent} />
          <ImportToLXNSButton />
        </div>
        <Timer expiresAt={pageData.expiresAt} />
      </div>

      <div
        class={`backdrop-blur-sm  border border-solid border-black/10 shadow-medium relative transition-colors ${
          qrMode === "standard" ? "bg-white/40" : "bg-white/95"
        } ${qrMode === "backup" ? "p-0" : "p-6"}`}
        onClick={() => {
          if (expired) {
            return;
          }
          setQrMode(
            qrMode === "standard"
              ? "high-contrast"
              : qrMode === "high-contrast"
              ? "backup"
              : "standard"
          );
        }}
      >
        {expired && (
          <div class="absolute inset-0 size-full bg-white/70 backdrop-blur-lg text-zinc-800/80 flex items-center justify-center text-sm text-center break-all">
            このQRコードは
            <br />
            期限が切れています
          </div>
        )}

        <div
          class={`absolute right-0 px-1 transition-all text-black/40 bg-white shadow-medium text-xs leading-none flex items-center h-5 rounded-b ${
            qrMode !== "standard"
              ? "opacity-100 -bottom-5"
              : "opacity-0 bottom-0"
          }`}
        >
          {
            {
              backup: "バックアップモード",
              "high-contrast": "高反差モード",
              standard: "標準モード",
            }[qrMode]
          }
        </div>

        {qrMode === "backup" ? (
          <img
            src={"http://wq.sys-all.cn/qrcode/img/" + pageData.imageId + ".png"}
            width={340}
            height={180}
            class="size-[248px] object-cover"
          />
        ) : (
          <QRCodeSVG
            value={qrcodeContent}
            level="M"
            bgColor="#ffffff00"
            fgColor="#000000"
            marginSize={0}
            size={200}
          />
        )}
      </div>
    </div>
  );
}

render(<App />, document.getElementById("app"));
