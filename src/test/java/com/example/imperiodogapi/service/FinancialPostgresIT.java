package com.example.imperiodogapi.service;

import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.TestContext;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.support.AbstractTestExecutionListener;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.core.io.FileSystemResource;
import javax.sql.DataSource;
import static org.junit.jupiter.api.Assertions.*;

// Runs the same failure/replay/authorization scenarios against a real PostgreSQL server.
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestExecutionListeners(listeners = FinancialPostgresIT.StopPostgres.class,
        mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
public class FinancialPostgresIT extends FinancialFlowTest {
    static final EmbeddedPostgres POSTGRES = start();

    private static EmbeddedPostgres start() {
        try {
            return EmbeddedPostgres.builder().setPort(0).start();
        } catch (IOException exception) { throw new ExceptionInInitializerError(exception); }
    }

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> POSTGRES.getJdbcUrl("postgres", "postgres"));
        registry.add("spring.datasource.username", () -> "postgres");
        registry.add("spring.datasource.password", () -> "postgres");
    }

    @Test
    void incrementalSchemaUpgradeIsRepeatable(@Autowired DataSource dataSource) {
        org.mockito.Mockito.when(bank.createBoleto(org.mockito.ArgumentMatchers.any()))
                .thenReturn(boleto("unused", "CREATED"));
        var response = charges.createCharge(request, KEY);
        // Reproduce the previous schema rather than only rerunning DDL on new tables.
        var jdbc = new org.springframework.jdbc.core.JdbcTemplate(dataSource);
        jdbc.execute("ALTER TABLE charges DROP COLUMN version, DROP COLUMN idempotency_key, "
                + "DROP COLUMN issuance_state, DROP COLUMN customer_name_snapshot, "
                + "DROP COLUMN pet_name_snapshot, DROP COLUMN service_name_snapshot");
        var migration = new ResourceDatabasePopulator(new FileSystemResource("docs/sql/2026-11-financial-consistency.sql"));
        migration.execute(dataSource);
        migration.execute(dataSource);
        var migrated = chargeRepository.findById(response.id()).orElseThrow();
        assertEquals("ISSUED", migrated.getIssuanceState());
        assertEquals("Maria", migrated.getCustomerNameSnapshot());
        assertEquals("Rex", migrated.getPetNameSnapshot());
        assertEquals("Banho", migrated.getServiceNameSnapshot());
    }

    public static class StopPostgres extends AbstractTestExecutionListener {
        @Override public int getOrder() { return 0; }
        @Override public void afterTestClass(TestContext context) throws IOException {
            // afterTestClass listeners run in reverse order: Spring closes its context first.
            POSTGRES.close();
        }
    }
}
