"use client";

import { useState } from "react";
import classes from "./FtmoiSignature.module.css";

/**
 * "FTMOI 2026" signature that morphs into "From The Mind Of Idrees :) 2026"
 * on hover / focus. The short form is an acrostic of the long form so each
 * capital letter in "From The Mind Of Idrees" keeps its position while the
 * rest of the words fade in. Inspired by muhammadidrees.com.
 */
export function FtmoiSignature() {
  const [open, setOpen] = useState(false);

  const segments: { cap: string; rest: string }[] = [
    { cap: "F", rest: "rom" },
    { cap: "T", rest: "he" },
    { cap: "M", rest: "ind" },
    { cap: "O", rest: "f" },
    { cap: "I", rest: "drees" },
  ];

  return (
    <a
      href="https://www.muhammadidrees.com"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="From The Mind Of Idrees — muhammadidrees.com"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      className={classes.root}
      data-open={open ? "true" : undefined}
    >
      <span className={classes.year}>© {new Date().getFullYear()}</span>
      {segments.map((s, i) => (
        <span key={i} className={classes.segment}>
          <span>{s.cap}</span>
          <span aria-hidden="true" className={classes.rest}>
            {s.rest}
          </span>
        </span>
      ))}
      <span aria-hidden="true" className={classes.smiley}>
        :)
      </span>
    </a>
  );
}
