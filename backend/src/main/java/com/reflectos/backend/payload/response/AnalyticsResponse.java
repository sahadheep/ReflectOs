package com.reflectos.backend.payload.response;

import java.util.List;

public class AnalyticsResponse {

    private int totalEntriesLogged;
    private String topMood;
    private int daysTracked;
    private List<DailyStat> dailyStats;

    public AnalyticsResponse() {
    }

    public AnalyticsResponse(int totalEntriesLogged, String topMood, int daysTracked, List<DailyStat> dailyStats) {
        this.totalEntriesLogged = totalEntriesLogged;
        this.topMood = topMood;
        this.daysTracked = daysTracked;
        this.dailyStats = dailyStats;
    }

    public int getTotalEntriesLogged() {
        return totalEntriesLogged;
    }

    public void setTotalEntriesLogged(int totalEntriesLogged) {
        this.totalEntriesLogged = totalEntriesLogged;
    }

    public String getTopMood() {
        return topMood;
    }

    public void setTopMood(String topMood) {
        this.topMood = topMood;
    }

    public int getDaysTracked() {
        return daysTracked;
    }

    public void setDaysTracked(int daysTracked) {
        this.daysTracked = daysTracked;
    }

    public List<DailyStat> getDailyStats() {
        return dailyStats;
    }

    public void setDailyStats(List<DailyStat> dailyStats) {
        this.dailyStats = dailyStats;
    }

    public static class DailyStat {
        private String date;
        private int tasksCompleted;
        private int tasksTotal;
        private double productivityScore;
        private String mood;
        private boolean diaryLogged;

        public DailyStat(String date, int tasksCompleted, int tasksTotal, double productivityScore, String mood, boolean diaryLogged) {
            this.date = date;
            this.tasksCompleted = tasksCompleted;
            this.tasksTotal = tasksTotal;
            this.productivityScore = productivityScore;
            this.mood = mood;
            this.diaryLogged = diaryLogged;
        }

        public String getDate() {
            return date;
        }

        public int getTasksCompleted() {
            return tasksCompleted;
        }

        public int getTasksTotal() {
            return tasksTotal;
        }

        public double getProductivityScore() {
            return productivityScore;
        }

        public String getMood() {
            return mood;
        }

        public boolean isDiaryLogged() {
            return diaryLogged;
        }
    }
}
