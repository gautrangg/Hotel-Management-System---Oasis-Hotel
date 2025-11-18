import React from "react";

export default function SidebarProfile({ name, role, avatar }) {
    return (
        <div className="profile">
            <img
                src={avatar || "https://i.pravatar.cc/101"}
                alt={`${name} avatar`}
                className="avatar"
            />
            <div>
                <h4>{name}</h4>
                <p>{role}</p>
            </div>
        </div>
    );
}