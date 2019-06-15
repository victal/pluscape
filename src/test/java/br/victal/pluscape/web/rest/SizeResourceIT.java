package br.victal.pluscape.web.rest;

import br.victal.pluscape.PluscapeApp;
import br.victal.pluscape.domain.Size;
import br.victal.pluscape.repository.SizeRepository;
import br.victal.pluscape.web.rest.errors.ExceptionTranslator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.Validator;

import javax.persistence.EntityManager;
import java.util.List;

import static br.victal.pluscape.web.rest.TestUtil.createFormattingConversionService;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for the {@Link SizeResource} REST controller.
 */
@SpringBootTest(classes = PluscapeApp.class)
public class SizeResourceIT {

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    @Autowired
    private SizeRepository sizeRepository;

    @Autowired
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Autowired
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Autowired
    private ExceptionTranslator exceptionTranslator;

    @Autowired
    private EntityManager em;

    @Autowired
    private Validator validator;

    private MockMvc restSizeMockMvc;

    private Size size;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final SizeResource sizeResource = new SizeResource(sizeRepository);
        this.restSizeMockMvc = MockMvcBuilders.standaloneSetup(sizeResource)
            .setCustomArgumentResolvers(pageableArgumentResolver)
            .setControllerAdvice(exceptionTranslator)
            .setConversionService(createFormattingConversionService())
            .setMessageConverters(jacksonMessageConverter)
            .setValidator(validator).build();
    }

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Size createEntity(EntityManager em) {
        Size size = new Size()
            .description(DEFAULT_DESCRIPTION);
        return size;
    }
    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Size createUpdatedEntity(EntityManager em) {
        Size size = new Size()
            .description(UPDATED_DESCRIPTION);
        return size;
    }

    @BeforeEach
    public void initTest() {
        size = createEntity(em);
    }

    @Test
    @Transactional
    public void createSize() throws Exception {
        int databaseSizeBeforeCreate = sizeRepository.findAll().size();

        // Create the Size
        restSizeMockMvc.perform(post("/api/sizes")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(size)))
            .andExpect(status().isCreated());

        // Validate the Size in the database
        List<Size> sizeList = sizeRepository.findAll();
        assertThat(sizeList).hasSize(databaseSizeBeforeCreate + 1);
        Size testSize = sizeList.get(sizeList.size() - 1);
        assertThat(testSize.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
    }

    @Test
    @Transactional
    public void createSizeWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = sizeRepository.findAll().size();

        // Create the Size with an existing ID
        size.setId(1L);

        // An entity with an existing ID cannot be created, so this API call must fail
        restSizeMockMvc.perform(post("/api/sizes")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(size)))
            .andExpect(status().isBadRequest());

        // Validate the Size in the database
        List<Size> sizeList = sizeRepository.findAll();
        assertThat(sizeList).hasSize(databaseSizeBeforeCreate);
    }


    @Test
    @Transactional
    public void checkDescriptionIsRequired() throws Exception {
        int databaseSizeBeforeTest = sizeRepository.findAll().size();
        // set the field null
        size.setDescription(null);

        // Create the Size, which fails.

        restSizeMockMvc.perform(post("/api/sizes")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(size)))
            .andExpect(status().isBadRequest());

        List<Size> sizeList = sizeRepository.findAll();
        assertThat(sizeList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllSizes() throws Exception {
        // Initialize the database
        sizeRepository.saveAndFlush(size);

        // Get all the sizeList
        restSizeMockMvc.perform(get("/api/sizes?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(size.getId().intValue())))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())));
    }
    
    @Test
    @Transactional
    public void getSize() throws Exception {
        // Initialize the database
        sizeRepository.saveAndFlush(size);

        // Get the size
        restSizeMockMvc.perform(get("/api/sizes/{id}", size.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(size.getId().intValue()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingSize() throws Exception {
        // Get the size
        restSizeMockMvc.perform(get("/api/sizes/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateSize() throws Exception {
        // Initialize the database
        sizeRepository.saveAndFlush(size);

        int databaseSizeBeforeUpdate = sizeRepository.findAll().size();

        // Update the size
        Size updatedSize = sizeRepository.findById(size.getId()).get();
        // Disconnect from session so that the updates on updatedSize are not directly saved in db
        em.detach(updatedSize);
        updatedSize
            .description(UPDATED_DESCRIPTION);

        restSizeMockMvc.perform(put("/api/sizes")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(updatedSize)))
            .andExpect(status().isOk());

        // Validate the Size in the database
        List<Size> sizeList = sizeRepository.findAll();
        assertThat(sizeList).hasSize(databaseSizeBeforeUpdate);
        Size testSize = sizeList.get(sizeList.size() - 1);
        assertThat(testSize.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    public void updateNonExistingSize() throws Exception {
        int databaseSizeBeforeUpdate = sizeRepository.findAll().size();

        // Create the Size

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restSizeMockMvc.perform(put("/api/sizes")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(size)))
            .andExpect(status().isBadRequest());

        // Validate the Size in the database
        List<Size> sizeList = sizeRepository.findAll();
        assertThat(sizeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteSize() throws Exception {
        // Initialize the database
        sizeRepository.saveAndFlush(size);

        int databaseSizeBeforeDelete = sizeRepository.findAll().size();

        // Delete the size
        restSizeMockMvc.perform(delete("/api/sizes/{id}", size.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isNoContent());

        // Validate the database is empty
        List<Size> sizeList = sizeRepository.findAll();
        assertThat(sizeList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Size.class);
        Size size1 = new Size();
        size1.setId(1L);
        Size size2 = new Size();
        size2.setId(size1.getId());
        assertThat(size1).isEqualTo(size2);
        size2.setId(2L);
        assertThat(size1).isNotEqualTo(size2);
        size1.setId(null);
        assertThat(size1).isNotEqualTo(size2);
    }
}
