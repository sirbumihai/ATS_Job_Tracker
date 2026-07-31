package com.jobtracker.ats.service;

import com.jobtracker.ats.dto.CreateJobRequest;
import com.jobtracker.ats.dto.JobResponse;
import com.jobtracker.ats.entity.JobPosting;
import com.jobtracker.ats.entity.User;
import com.jobtracker.ats.exception.ResourceNotFoundException;
import com.jobtracker.ats.repository.JobPostingRepository;
import com.jobtracker.ats.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobPostingServiceTest {

    @Mock
    private JobPostingRepository jobPostingRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private JobPostingService jobPostingService;

    private User testUser;
    private UUID userId;
    private UUID jobId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        jobId = UUID.randomUUID();
        testUser = User.builder()
                .id(userId)
                .email("test.user@gmail.com")
                .fullName("Test User")
                .build();
    }

    @Test
    @DisplayName("Trebuie să creeze cu succes un job nou când datele sunt valide")
    void createJob_Success() {
        // ARRANGE (Pregătirea datelor și a comportamentului mock-urilor)
        CreateJobRequest request = new CreateJobRequest(
                "Amazon", 
                "Backend Engineer", 
                "https://amazon.jobs/123", 
                "Căutăm Java Developer cu Spring Boot"
        );

        JobPosting savedPosting = JobPosting.builder()
                .id(jobId)
                .user(testUser)
                .companyName(request.companyName())
                .jobTitle(request.jobTitle())
                .jobUrl(request.jobUrl())
                .rawDescription(request.rawDescription())
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(jobPostingRepository.saveAndFlush(any(JobPosting.class))).thenReturn(savedPosting);

        // ACT (Executarea metodei testate)
        JobResponse response = jobPostingService.createJob(userId, request);

        // ASSERT (Verificarea rezultatelor)
        assertNotNull(response);
        assertEquals(jobId, response.id());
        assertEquals("Amazon", response.companyName());
        assertEquals("Backend Engineer", response.jobTitle());

        // VERIFY (Verificăm că metodele mock-urilor au fost apelate o singură dată)
        verify(userRepository, times(1)).findById(userId);
        verify(jobPostingRepository, times(1)).saveAndFlush(any(JobPosting.class));
    }

    @Test
    @DisplayName("Trebuie să arunce ResourceNotFoundException când utilizatorul nu există")
    void createJob_UserNotFound_ThrowsException() {
        // ARRANGE
        CreateJobRequest request = new CreateJobRequest("Amazon", "Backend Engineer", null, "Descriere job...");
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // ACT & ASSERT
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> jobPostingService.createJob(userId, request)
        );

        assertTrue(exception.getMessage().contains("nu a fost găsit"));
        verify(jobPostingRepository, never()).saveAndFlush(any());
    }
}
