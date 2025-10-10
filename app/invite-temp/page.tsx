"use client";

import { useState } from "react";

export default function InviteTest() {
  const [emails, setEmails] = useState("");

  const sendInvites = () => {
    const emailsArr = emails.split(",").map((email) => email.trim());

    fetch("/api/invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emails: emailsArr,
      }),
    });
  };

  return (
    <>
      <h2>User Invite Test Page</h2>
      <p>Enter a comma separated list of emails to send invites to</p>
      <input
        type="text"
        placeholder="Emails"
        value={emails}
        onChange={(e) => setEmails(e.target.value)}
        className="border border-gray-300 p-2"
      />
      <button onClick={sendInvites} className="bg-blue-500 text-white p-2">
        Send Invites
      </button>
    </>
  );
}
