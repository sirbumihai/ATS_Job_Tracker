package com.jobtracker.ats.service;

import com.jobtracker.ats.dto.ApplicationResponse;
import com.jobtracker.ats.entity.Application;
import com.jobtracker.ats.entity.Application.ApplicationStatus;
import com.jobtracker.ats.entity.JobPosting;
import com.jobtracker.ats.entity.User;
import com.jobtracker.ats.exception.ResourceNotFoundException;
import com.jobtracker.ats.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JobPostingRepository jobPostingRepository;

    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private CvProfileRepository cvProfileRepository;

    @Mock
    private VectorEmbeddingService vectorEmbeddingService;

    @Mock
    private CachedJobListingRepository cachedJobListingRepository;

    @InjectMocks
    private ApplicationService applicationService;

    private UUID appId;
    private UUID userId;
    private User testUser;
    private JobPosting testJob;
    private Application testApp;

    @BeforeEach
    void setUp() {
        appId = UUID.randomUUID();
        userId = UUID.randomUUID();

        testUser = User.builder()
                .id(userId)
                .email("test@jobflow.ro")
                .fullName("Mihai Sirbu")
                .build();

        testJob = JobPosting.builder()
                .id(UUID.randomUUID())
                .companyName("TechCorp")
                .jobTitle("Senior Java Developer")
                .jobUrl("https://techcorp.com/jobs/1")
                .rawDescription("Java 21, Spring Boot, Microservices")
                .build();

        testApp = Application.builder()
                .id(appId)
                .user(testUser)
                .jobPosting(testJob)
                .status(ApplicationStatus.SAVED)
                .semanticMatchScore(BigDecimal.valueOf(92.0))
                .notes("Notita initiala")
                .appliedDate(LocalDate.now().minusDays(2))
                .createdAt(OffsetDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Trebuie sa actualizeze cu succes notitele si data aplicatiei")
    void updateApplicationNotes_Success() {
        when(applicationRepository.findById(appId)).thenReturn(Optional.of(testApp));
        when(applicationRepository.save(any(Application.class))).thenAnswer(invocation -> invocation.getArgument(0));

        String newNotes = "Interviu tehnic programat miercuri la 14:00. Pachet salarial discutat: 3000 EUR.";
        LocalDate newDate = LocalDate.now();

        ApplicationResponse response = applicationService.updateApplicationNotes(appId, newNotes, newDate);

        assertNotNull(response);
        assertEquals(appId, response.id());
        assertEquals(newNotes, response.notes());
        assertEquals(newDate, response.appliedDate());

        verify(applicationRepository, times(1)).findById(appId);
        verify(applicationRepository, times(1)).save(testApp);
    }

    @Test
    @DisplayName("Trebuie sa arunce ResourceNotFoundException cand aplicatia nu exista la actualizare notite")
    void updateApplicationNotes_NotFound() {
        when(applicationRepository.findById(appId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> 
                applicationService.updateApplicationNotes(appId, "Notita", LocalDate.now())
        );

        verify(applicationRepository, times(1)).findById(appId);
        verify(applicationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Trebuie sa actualizeze statusul unei aplicatii")
    void updateApplicationStatus_Success() {
        when(applicationRepository.findById(appId)).thenReturn(Optional.of(testApp));
        when(applicationRepository.save(any(Application.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ApplicationResponse response = applicationService.updateApplicationStatus(appId, ApplicationStatus.INTERVIEWING);

        assertNotNull(response);
        assertEquals(ApplicationStatus.INTERVIEWING, response.status());
        verify(applicationRepository, times(1)).save(testApp);
    }

    @Test
    @DisplayName("Trebuie sa stearga o aplicatie existenta")
    void deleteApplication_Success() {
        when(applicationRepository.findById(appId)).thenReturn(Optional.of(testApp));

        assertDoesNotThrow(() -> applicationService.deleteApplication(appId));

        verify(applicationRepository, times(1)).findById(appId);
        verify(applicationRepository, times(1)).delete(testApp);
    }

    @Test
    @DisplayName("Trebuie sa arunce exceptie la stergerea unei aplicatii inexistente")
    void deleteApplication_NotFound() {
        when(applicationRepository.findById(appId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> applicationService.deleteApplication(appId));

        verify(applicationRepository, times(1)).findById(appId);
        verify(applicationRepository, never()).delete(any());
    }
}
