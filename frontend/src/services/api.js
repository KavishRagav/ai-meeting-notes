import axios from "axios";

const BASE =
  "https://meeting-notes-api-kkt-e8bgbcg9bfbsfzfu.centralindia-01.azurewebsites.net";

export const api = axios.create({ baseURL: BASE });

export const transcribeAudio = async (file) => {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post("/transcribe", form);
  return data;
};

export const generateNotes = async (text, meetingTitle = "Meeting") => {
  const { data } = await api.post("/generate-notes", {
    text,
    meeting_title: meetingTitle,
  });
  return data;
};

export const processFull = async (file, meetingTitle = "Meeting") => {
  const form = new FormData();
  form.append("file", file);
  form.append("meeting_title", meetingTitle);
  const { data } = await api.post("/process-full", form);
  return data;
};
