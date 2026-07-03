package com.reflectos.backend.payload.request;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public class FocusLoopRequest {
    @NotBlank
    private String dailyGoal;

    public String getDailyGoal() {
        return dailyGoal;
    }

    public void setDailyGoal(String dailyGoal) {
        this.dailyGoal = dailyGoal;
    }
}
