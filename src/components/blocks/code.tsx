"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Code, Copy } from "lucide-react";

type Token = {
  keywords: RegExp;
  types: RegExp;
  strings: RegExp;
  comments: RegExp;
  numbers: RegExp;
  operators: RegExp;
  functions: RegExp;
  properties: RegExp;
  components: RegExp;
};

const tokenSpec: Token = {
  keywords:
    /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|delete|typeof|instanceof|void|throw|try|catch|finally|class|extends|super|import|export|default|from|of|in|async|await|yield|static|get|set|null|undefined|true|false|this|prototype|type|interface|enum)\b/g,
  types:
    /\b(any|boolean|number|string|void|useState|useEffect|useContext|useMemo|useCallback|useRef)\b/g,
  strings: /(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g,
  comments: /(?<!:)(\/\/[^\n]*)|(\/\*[\s\S]*?\*\/)/g,
  numbers: /\b(\d+\.?\d*)\b/g,
  operators:
    /(?<!<)[+\-*%&|^~=!?:,;.[\]{}()](?![A-Z])|(?<![A-Z/])(?![A-Z])(?<![A-Z])(?!\/?>)[<>]/g,
  functions: /\b(?!return\b)([a-zA-Z_$][a-zA-Z0-9_]*)\s*(?=\()/g,
  properties: /([a-zA-Z-]+\s*(?==))/g,
  components: /(?<!function\s+)\b([A-Z][a-zA-Z0-9]+)\b/g,
};

const tokenClasses: Record<string, string> = {
  keyword: "text-[#C678DD]",
  type: "text-[#E5C07B]",
  string: "text-[#85C379]",
  comment: "text-[#7F848E]",
  number: "text-[#D19A66]",
  operator: "text-[#56B6C2]",
  function: "text-[#61AFEF]",
  property: "text-[#D19A66]",
  component: "text-[#E5C07B]",
  plain: "text-[#ACB2BF]",
};

function tokenize(code: string) {
  const len = code.length;
  const tokens: Array<{
    type: "comment" | "string" | "code";
    value: string;
  }> = [];

  // Mark regions by priority: comments > strings > everything else
  const masked: Array<"comment" | "string" | null> = new Array(len).fill(null);

  const markRegion = (regex: RegExp | null, type: "comment" | "string") => {
    if (!regex) return;
    regex.lastIndex = 0;
    let m;
    while ((m = regex.exec(code)) !== null) {
      for (let i = m.index; i < m.index + m[0].length; i++) {
        if (masked[i] === null) masked[i] = type;
      }
    }
  };

  markRegion(tokenSpec.comments || null, "comment");
  markRegion(tokenSpec.strings || null, "string");

  let i = 0;
  while (i < len) {
    if (masked[i] === "comment" || masked[i] === "string") {
      const type = masked[i] as "comment" | "string";
      let j = i;
      while (j < len && masked[j] === type) j++;
      tokens.push({ type, value: code.slice(i, j) });
      i = j;
    } else {
      let j = i;
      while (j < len && masked[j] === null) j++;
      const segment = code.slice(i, j);
      tokens.push({ type: "code", value: segment });
      i = j;
    }
  }

  const final: Array<{ type: string; value: string; start?: number }> = [];
  for (const token of tokens) {
    if (token.type !== "code") {
      final.push(token);
      continue;
    }
    const seg = token.value;
    const matches: Array<{
      start: number;
      end: number;
      type:
        | "decorator"
        | "keyword"
        | "type"
        | "function"
        | "property"
        | "number"
        | "operator"
        | "component";
      value: string;
    }> = [];

    const collect = (
      regex: RegExp | null,
      type:
        | "decorator"
        | "keyword"
        | "type"
        | "function"
        | "property"
        | "number"
        | "operator"
        | "component",
    ) => {
      if (!regex) return;
      const r = new RegExp(
        regex.source,
        regex.flags.includes("g") ? regex.flags : regex.flags + "g",
      );
      r.lastIndex = 0;
      let m;
      while ((m = r.exec(seg)) !== null) {
        matches.push({
          start: m.index,
          end: m.index + m[0].length,
          type,
          value: m[0],
        });
      }
    };

    collect(tokenSpec.keywords || null, "keyword");
    collect(tokenSpec.types || null, "type");
    collect(tokenSpec.properties || null, "property");
    collect(tokenSpec.numbers || null, "number");
    collect(tokenSpec.operators || null, "operator");
    collect(tokenSpec.components || null, "component");
    collect(tokenSpec.functions || null, "function");

    const used = new Array(seg.length).fill(false);
    const sorted = matches.sort(
      (a, b) => a.start - b.start || b.end - b.start - (a.end - a.start),
    );

    let pos = 0;
    const subTokens: Array<{ type: string; value: string; start: number }> = [];
    for (const m of sorted) {
      if (used[m.start]) continue;
      let skip = false;
      for (let k = m.start; k < m.end; k++) {
        if (used[k]) {
          skip = true;
          break;
        }
      }
      if (skip) continue;
      if (m.start > pos) {
        subTokens.push({
          type: "plain",
          value: seg.slice(pos, m.start),
          start: pos,
        });
      }
      subTokens.push({ type: m.type, value: m.value, start: m.start });
      for (let k = m.start; k < m.end; k++) used[k] = true;
      pos = m.end;
    }
    if (pos < seg.length) {
      subTokens.push({ type: "plain", value: seg.slice(pos), start: pos });
    }

    final.push(...subTokens);
  }

  return final;
}

function renderLine(line: string, lineIdx: number) {
  const tokens = tokenize(line);
  return (
    <span key={lineIdx}>
      {tokens.map((tok, i) => (
        <span key={i} className={tokenClasses[tok.type] || tokenClasses.plain}>
          {tok.value}
        </span>
      ))}
    </span>
  );
}

export function CodeBlock({
  code = "",
  directory = "",
  showLineNumbers = true,
}: {
  code?: string;
  directory?: string;
  showLineNumbers?: boolean;
}) {
  const lines = code.split("\n");

  return (
    <Card className="overflow-hidden border-border p-4 gap-0 dark:bg-card bg-secondary">
      <CardHeader className="flex flex-row justify-between items-center p-0 m-0">
        <div className="flex flex-row items-center gap-2 text-muted-foreground/70">
          <Code className="size-4" />
          <span className="font-mono text-xs">{directory}</span>
        </div>
        <Button
          variant={"ghost"}
          className={"h-8 aspect-square p-0 text-muted-foreground"}
          onClick={() => navigator.clipboard.writeText(code.toWellFormed())}
        >
          <Copy />
        </Button>
      </CardHeader>
      <Separator className="my-2" />
      <CardContent className="overflow-x-auto px-0">
        <pre className="m-0 font-mono text-sm leading-6">
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx}>
                  {showLineNumbers && (
                    <td className="w-10 pr-6 text-right text-xs text-muted-foreground/70 select-none">
                      {idx + 1}
                    </td>
                  )}
                  <td>{renderLine(line || " ", idx)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </pre>
      </CardContent>
    </Card>
  );
}
