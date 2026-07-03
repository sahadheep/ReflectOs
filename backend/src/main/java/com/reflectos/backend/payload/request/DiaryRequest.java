package com.reflectos.backend.payload.request;

public class DiaryRequest {
    private String mood;
    private String content;

    public String getMood() {
        return mood;
    }

    public void setMood(String mood) {
        this.mood = mood;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
