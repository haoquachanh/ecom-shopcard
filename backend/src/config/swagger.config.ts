import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Ecom Shopcard Storefront API')
    .setDescription('Production-ready storefront APIs')
    .setVersion('1.0.0')
    .setContact('Ecom Shopcard', 'https://shopcard.example.com', 'support@shopcard.example.com')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // Expose Swagger UI at /api/docs for clarity with API routes
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'Ecom Shopcard API Docs',
  });
}
