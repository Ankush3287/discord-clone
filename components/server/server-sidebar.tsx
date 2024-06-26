import { redirect } from "next/navigation";
import { ChannnelType, MemberRole } from "@prisma/client";

import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";


import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { ServerSearch } from "./server-search";
import { ServerSection } from "./server-section";
import { ServerChannel } from "./server-channel";
import { ServerHeader } from "./server-header";
import { ServerMember } from "./server-member";


interface ServerSidebarProps {
    serverId: string;
}

const iconMap = {
    [ChannnelType.TEXT]: <Hash className="mr-2 h-4 w-4" />,
    [ChannnelType.AUDIO]: <Mic className="mr-2 h-4 w-4" />,
    [ChannnelType.VIDEO]: <Video className="mr-2 h-4 w-4" />,
}

const roleIconMap = {
    [MemberRole.GUEST]: null,
    [MemberRole.MODERATOR]: <ShieldCheck className="mr-2 h-4 w-4 text-indigo-500" />,
    [MemberRole.ADMIN]: <ShieldAlert className="mr-2 h-4 w-4 text-rose-500" />
}

export const ServerSidebar = async ({
    serverId,
}: ServerSidebarProps) => {

    const profile = await currentProfile();

    if (!profile) {
        return redirect("/");
    }

    const server = await db.server.findUnique({
        where: {
            id: serverId,
        },
        include: {
            channels: {
                orderBy: {
                    createdAt: "asc",
                },
            },
            members: {
                include: {
                    profile: true,
                },
                orderBy: {
                    role: "asc",
                }
            }
        }
    });

    const textChannels = server?.channels.filter((channel) => channel.type === ChannnelType.TEXT);
    const audioChannels = server?.channels.filter((channel) => channel.type === ChannnelType.AUDIO);
    const videoChannels = server?.channels.filter((channel) => channel.type === ChannnelType.VIDEO);

    const members = server?.members.filter((member) => member.profileId !== profile.id);

    if (!server) {
        return redirect("/");
    }

    const role = server.members.find((member) => member.profileId === profile.id)?.role;

    return (
        <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
            <ServerHeader
                server={server}
                role={role}
            />
            <ScrollArea className="flex-1 px-3">
                <div className="mt-2">
                    <ServerSearch
                        data={[
                            {
                                label: "Text Channels",
                                type: "channel",
                                data: textChannels?.map((channel) => ({
                                    id: channel.id,
                                    name: channel.name,
                                    icon: iconMap[channel.type]
                                }))
                            },
                            {
                                label: "Voice Channels",
                                type: "channel",
                                data: audioChannels?.map((channel) => ({
                                    id: channel.id,
                                    name: channel.name,
                                    icon: iconMap[channel.type]
                                }))
                            },
                            {
                                label: "Video Channels",
                                type: "channel",
                                data: videoChannels?.map((channel) => ({
                                    id: channel.id,
                                    name: channel.name,
                                    icon: iconMap[channel.type]
                                }))
                            },
                            {
                                label: "Members",
                                type: "member",
                                data: members?.map((member) => ({
                                    id: member.id,
                                    name: member.profile.name,
                                    icon: roleIconMap[member.role],
                                }))
                            }
                        ]}
                    />
                </div>
                <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2" />
                {!!textChannels?.length && (
                    <div className="mb-2">
                        <ServerSection
                            label="Text Channels"
                            sectionType="channels"
                            channelType={ChannnelType.TEXT}
                            role={role}
                        />
                        <div className="space-y-[2px]">
                            {textChannels.map((channel) => (
                                <ServerChannel
                                    key={channel.id}
                                    role={role}
                                    server={server}
                                    channel={channel}
                                />
                            ))}
                        </div>
                    </div>
                )}
                {!!audioChannels?.length && (
                    <div className="mb-2">
                        <ServerSection
                            label="Voice Channels"
                            sectionType="channels"
                            channelType={ChannnelType.AUDIO}
                            role={role}
                        />
                        <div className="space-y-[2px]">
                            {audioChannels.map((channel) => (
                                <ServerChannel
                                    key={channel.id}
                                    role={role}
                                    server={server}
                                    channel={channel}
                                />
                            ))}
                        </div>
                    </div>
                )}
                {!!videoChannels?.length && (
                    <div className="mb-2">
                        <ServerSection
                            label="Video Channels"
                            sectionType="channels"
                            channelType={ChannnelType.VIDEO}
                            role={role}
                        />
                        <div className="space-y-[2px]">
                            {videoChannels.map((channel) => (
                                <ServerChannel
                                    key={channel.id}
                                    role={role}
                                    server={server}
                                    channel={channel}
                                />
                            ))}
                        </div>
                    </div>
                )}
                {!!members?.length && (
                    <div className="mb-2">
                        <ServerSection
                            label="Members"
                            sectionType="members"
                            role={role}
                            server={server}
                        />
                        <div className="space-y-[2px]">
                            {members.map((member) => (
                                <ServerMember
                                    key={member.id}
                                    server={server}
                                    member={member}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </ScrollArea>
        </div>
    );
};