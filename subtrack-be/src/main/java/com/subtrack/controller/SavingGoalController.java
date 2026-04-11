package com.subtrack.controller;

import com.subtrack.dto.request.SavingGoalRequest;
import com.subtrack.dto.response.ApiResponse;
import com.subtrack.dto.response.SavingGoalResponse;
import com.subtrack.entity.SavingGoal;
import com.subtrack.entity.User;
import com.subtrack.exception.ForbiddenException;
import com.subtrack.exception.NotFoundException;
import com.subtrack.repository.SavingGoalRepository;
import com.subtrack.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/saving-goals")
@RequiredArgsConstructor
public class SavingGoalController {

    private final SavingGoalRepository goalRepository;
    private final UserRepository userRepository;

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SavingGoalResponse>>> getGoals(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        
        List<SavingGoalResponse> goals = goalRepository.findByUserIdOrderByAchievedAscNameAsc(user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(ApiResponse.ok(goals));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SavingGoalResponse>> createGoal(
            @Valid @RequestBody SavingGoalRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        
        SavingGoal goal = SavingGoal.builder()
                .userId(user.getId())
                .name(request.getName())
                .targetAmount(request.getTargetAmount())
                .currentSaved(BigDecimal.ZERO)
                .achieved(false)
                .build();
                
        goal = goalRepository.save(goal);
        return ResponseEntity.ok(ApiResponse.ok(toResponse(goal)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGoal(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        
        SavingGoal goal = goalRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Goal not found"));
                
        if (!goal.getUserId().equals(user.getId())) {
            throw new ForbiddenException("Not your goal");
        }
        
        goalRepository.delete(goal);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
    
    @PutMapping("/{id}/add-funds")
    public ResponseEntity<ApiResponse<SavingGoalResponse>> addFunds(
            @PathVariable UUID id,
            @RequestParam BigDecimal amount,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        
        SavingGoal goal = goalRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Goal not found"));
                
        if (!goal.getUserId().equals(user.getId())) {
            throw new ForbiddenException("Not your goal");
        }
        
        if (!goal.isAchieved()) {
            goal.setCurrentSaved(goal.getCurrentSaved().add(amount));
            if (goal.getCurrentSaved().compareTo(goal.getTargetAmount()) >= 0) {
                goal.setAchieved(true);
                goal.setCurrentSaved(goal.getTargetAmount());
            }
            goal = goalRepository.save(goal);
        }
        
        return ResponseEntity.ok(ApiResponse.ok(toResponse(goal)));
    }

    private SavingGoalResponse toResponse(SavingGoal goal) {
        return SavingGoalResponse.builder()
                .id(goal.getId())
                .name(goal.getName())
                .targetAmount(goal.getTargetAmount())
                .currentSaved(goal.getCurrentSaved())
                .achieved(goal.isAchieved())
                .build();
    }
}
