/**
 * `@bucketplace/icons` 대체 진입점.
 * `src/catalog/ods-icons.json` 에 정의된 이름과 동일한 React 컴포넌트는
 * `src/lib/ods-icons.tsx` 의 SVG 로 제공된다.
 *
 * 사내 패키지를 쓸 때는 tsconfig 의 paths 에서 이 파일 매핑을 제거한다.
 */
export * from "../lib/ods-icons";
