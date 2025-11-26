"use client";

import { useState } from "react";
import { VisibilityScope } from "@workspace/store/utils/permissions/types";

export interface VisibilitySelectorProps {
    value: VisibilityScope;
    onChange: (scope: VisibilityScope) => void;
    onInviteUsers?: () => void;
    disabled?: boolean;
}

export function VisibilitySelector({
    value,
    onChange,
    onInviteUsers,
    disabled = false,
}: VisibilitySelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    const visibilityOptions: Array<{
        value: VisibilityScope;
        label: string;
        description: string;
    }> = [
            {
                value: "only_myself",
                label: "Only Me",
                description: "Visible only to you",
            },
            {
                value: "manually_selected",
                label: "Selected Users",
                description: "Share with specific people",
            },
            {
                value: "pod_specific",
                label: "My Pod",
                description: "Visible to your pod members",
            },
            {
                value: "org_specific",
                label: "My Organization",
                description: "Visible to your organization",
            },
            {
                value: "orgs_general",
                label: "All Organizations",
                description: "Visible to all org members",
            },
            {
                value: "regional",
                label: "Regional",
                description: "Visible to all regional members",
            },
        ];

    const currentOption = visibilityOptions.find((opt) => opt.value === value);

    return (
        <div className="relative">
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <div className="flex items-center gap-2">
                    <VisibilityIcon scope={value} />
                    <span>{currentOption?.label ?? value}</span>
                </div>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute z-20 w-full mt-1 bg-card text-card-foreground border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {visibilityOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                    if (option.value === "manually_selected" && onInviteUsers) {
                                        onInviteUsers();
                                    }
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-card-foreground/10 flex items-start gap-2"
                            >
                                <VisibilityIcon scope={option.value} className="mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-card-foreground">
                                        {option.label}
                                    </div>
                                    <div className="text-xs text-card-foreground/50">
                                        {option.description}
                                    </div>
                                </div>
                                {value === option.value && (
                                    <svg
                                        className="w-4 h-4 text-card-foreground"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function VisibilityIcon({
    scope,
    className = "",
}: {
    scope: VisibilityScope;
    className?: string;
}) {
    const iconClass = `w-4 h-4 ${className}`;

    switch (scope) {
        case "only_myself":
            return (
                <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                </svg>
            );
        case "manually_selected":
            return (
                <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                </svg>
            );
        case "pod_specific":
            return (
                <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                </svg>
            );
        case "org_specific":
        case "orgs_general":
            return (
                <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                </svg>
            );
        case "regional":
            return (
                <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            );
        default:
            return (
                <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                </svg>
            );
    }
}

export function VisibilityChip({ scope }: { scope: VisibilityScope }) {
    const labels: Record<string, string> = {
        only_myself: "Only Me",
        manually_selected: "Selective",
        pod_specific: "Pod",
        org_specific: "Organization",
        orgs_general: "All Orgs",
        regional: "Regional",
        private: "Private",
    };

    const colors: Record<string, string> = {
        only_myself: "bg-purple-100 text-purple-800",
        manually_selected: "bg-blue-100 text-blue-800",
        pod_specific: "bg-green-100 text-green-800",
        org_specific: "bg-yellow-100 text-yellow-800",
        orgs_general: "bg-orange-100 text-orange-800",
        regional: "bg-red-100 text-red-800",
        private: "bg-gray-100 text-gray-800",
    };

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors[scope] ?? "bg-gray-100 text-gray-800"
                }`}
        >
            <VisibilityIcon scope={scope} />
            {labels[scope] ?? scope}
        </span>
    );
}
