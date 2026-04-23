import type { ChannelType, UserChannel } from "@/types/spread";

export function getChannelMissingFields(channelType: ChannelType, channel?: Pick<UserChannel, "handle" | "channelUrl" | "followerCount" | "friendCount" | "verificationScreenshotUrl" | "isActive">) {
  if (!channel || !channel.isActive) return ["채널 등록"];

  const missing: string[] = [];
  if (!channel.handle.trim()) missing.push(channelType === "kakao" ? "카카오 닉네임" : "핸들");

  if (channelType === "kakao") {
    if (!channel.friendCount || channel.friendCount < 1) missing.push("친구수");
    if (!channel.verificationScreenshotUrl?.trim()) missing.push("인증 캡처");
    return missing;
  }

  if (!channel.channelUrl?.trim()) missing.push("채널 링크");
  if (channel.followerCount < 1) missing.push("팔로워수");
  return missing;
}

export function isChannelReady(channelType: ChannelType, channel?: Pick<UserChannel, "handle" | "channelUrl" | "followerCount" | "friendCount" | "verificationScreenshotUrl" | "isActive">) {
  return getChannelMissingFields(channelType, channel).length === 0;
}
